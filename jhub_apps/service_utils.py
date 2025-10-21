"""Utilities for configuring JupyterHub services."""
from typing import Dict, Any, Optional

from jhub_apps.service.models import AdditionalService


def service_for_jhub_apps(
    name: str,
    url: str,
    description: Optional[str] = None,
    pinned: bool = False,
    thumbnail: Optional[str] = None
) -> Dict[str, Any]:
    """Create a service configuration dict for JupyterHub services.

    This helper function creates the proper structure for external services
    that appear in the JupyterHub UI services menu. Services with pinned=True
    also appear in the quick access section. It validates the input using
    the AdditionalService Pydantic model.

    Args:
        name: Display name of the service
        url: URL path for the service
        description: Optional description of the service
        pinned: Whether the service should appear in the quick access section
        thumbnail: Optional thumbnail URL or base64-encoded data URL for the service icon

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
    additional_service = AdditionalService(
        name=name,
        url=url,
        description=description,
        pinned=pinned,
        thumbnail=thumbnail,
    )

    return {
        "name": additional_service.name,
        "display": True,
        "info": {
            "name": additional_service.name,
            "description": additional_service.description,
            "url": additional_service.url,
            "external": True,
            "pinned": additional_service.pinned,
            "thumbnail": additional_service.thumbnail,
        },
    }


def additional_service_to_service_dict(additional_service: AdditionalService) -> Dict[str, Any]:
    """Convert an AdditionalService model to a JupyterHub service dict.

    Args:
        additional_service: AdditionalService model instance

    Returns:
        Dictionary with JupyterHub service configuration
    """
    return service_for_jhub_apps(
        name=additional_service.name,
        url=additional_service.url,
        description=additional_service.description,
        pinned=additional_service.pinned,
        thumbnail=additional_service.thumbnail,
    )
