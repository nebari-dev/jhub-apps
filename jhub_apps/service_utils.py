"""Utilities for configuring JupyterHub services."""
from typing import Dict, Any, Optional

from jhub_apps.service.models import PinnedService


def service_for_jhub_apps(
    name: str,
    url: str,
    description: Optional[str] = None,
    pinned: bool = False,
    thumbnail: Optional[str] = None
) -> Dict[str, Any]:
    """Create a service configuration dict for JupyterHub services.

    This helper function creates the proper structure for external services
    that appear in the JupyterHub UI services menu. It validates the input
    using the PinnedService Pydantic model.

    Args:
        name: Display name of the service
        url: URL path for the service
        description: Optional description of the service
        pinned: Whether the service should be pinned in the UI
        thumbnail: Optional thumbnail URL or data URL for the service icon

    Returns:
        Dictionary with JupyterHub service configuration

    Raises:
        ValidationError: If the input parameters don't pass Pydantic validation

    Example:
        >>> from jhub_apps import service_for_jhub_apps
        >>> service = service_for_jhub_apps(
        ...     name="Monitoring",
        ...     url="/grafana",
        ...     pinned=True,
        ...     description="System monitoring dashboard"
        ... )
    """
    # Validate inputs using Pydantic model
    pinned_service = PinnedService(
        name=name,
        url=url,
        description=description,
        pinned=pinned,
        thumbnail=thumbnail,
    )

    return {
        "name": pinned_service.name,
        "display": True,
        "info": {
            "name": pinned_service.name,
            "description": pinned_service.description,
            "url": pinned_service.url,
            "external": True,
            "pinned": pinned_service.pinned,
            "thumbnail": pinned_service.thumbnail,
        },
    }


def pinned_service_to_service_dict(pinned_service: PinnedService) -> Dict[str, Any]:
    """Convert a PinnedService model to a JupyterHub service dict.

    Args:
        pinned_service: PinnedService model instance

    Returns:
        Dictionary with JupyterHub service configuration
    """
    return service_for_jhub_apps(
        name=pinned_service.name,
        url=pinned_service.url,
        description=pinned_service.description,
        pinned=pinned_service.pinned,
        thumbnail=pinned_service.thumbnail,
    )
