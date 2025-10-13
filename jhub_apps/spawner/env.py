"""Environment variable utilities for jhub-apps spawner."""
import shlex

import structlog


logger = structlog.get_logger(__name__)


def parse_proxy_args_from_env(env):
    """Parse jhub-app-proxy arguments from environment variables.

    Args:
        env: Environment variables dict

    Returns:
        List of argument strings to be added to jhub-app-proxy command

    Looks for JHUB_APP_PROXY_ARGS environment variable containing space-separated
    arguments for jhub-app-proxy CLI.

    Example:
        JHUB_APP_PROXY_ARGS="--ready-check-path=/health --ready-timeout=600"
    """
    proxy_args_str = env.get("JHUB_APP_PROXY_ARGS", "")
    if not proxy_args_str:
        return []

    try:
        # Use shlex to properly parse the arguments (handles quotes, spaces, etc.)
        return shlex.split(proxy_args_str)
    except ValueError as e:
        logger.warning(f"Failed to parse JHUB_APP_PROXY_ARGS: {e}")
        return []


def merge_proxy_args(base_args, env_args):
    """Merge environment-provided proxy args with base args, avoiding duplicates.

    Args:
        base_args: List of base command arguments
        env_args: List of environment-provided arguments

    Returns:
        List of merged arguments with duplicates removed

    When an argument appears in both base_args and env_args, the version from
    env_args takes precedence (allowing user override).

    Handles both --flag and --key=value style arguments.
    """
    if not env_args:
        return base_args

    # Extract flag names from arguments (handles --flag and --key=value)
    def get_flag_name(arg):
        """Extract the flag name from an argument."""
        if not isinstance(arg, str) or not arg.startswith("--"):
            return None
        # Handle --key=value format
        if "=" in arg:
            return arg.split("=")[0]
        # Handle --flag format
        return arg

    # Build set of flags from env_args that should override base_args
    env_flags = {get_flag_name(arg) for arg in env_args if get_flag_name(arg)}

    # Filter out base_args that are overridden by env_args
    filtered_base_args = [
        arg for arg in base_args
        if get_flag_name(arg) not in env_flags
    ]

    # Combine filtered base args with env args
    return filtered_base_args + env_args
