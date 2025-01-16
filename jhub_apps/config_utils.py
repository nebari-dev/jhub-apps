import textwrap
import typing as t
from pydantic import BaseModel, ValidationError
from traitlets import Unicode, Union, List, Callable, Integer, TraitType, TraitError

from traitlets.config import SingletonConfigurable, Enum

from jhub_apps.service.models import StartupApp


class PydanticModelTrait(TraitType):
    """A trait type for validating Pydantic models.
    
    This trait ensures that the input is an instance of a specific Pydantic model type.
    """
    
    def __init__(self, model_class: t.Type[BaseModel], *args, **kwargs):
        """
        Initialize the trait with a specific Pydantic model class.
        
        Args:
            model_class: The Pydantic model class to validate against
            *args: Additional arguments for TraitType
            **kwargs: Additional keyword arguments for TraitType
        """
        super().__init__(*args, **kwargs)
        self.model_class = model_class
        self.info_text = f"an instance of {model_class.__name__}"
    
    def validate(self, obj: t.Any, value: t.Any) -> BaseModel:
        """
        Validate that the input is an instance of the specified Pydantic model.
        
        Args:
            obj: The object the trait is attached to
            value: The value to validate
        
        Returns:
            Validated Pydantic model instance
        
        Raises:
            TraitError: If the value is not a valid instance of the model
        """
        # If None is allowed and value is None, return None
        if self.allow_none and value is None:
            return None
        
        # Check if value is an instance of the specified model class
        if isinstance(value, self.model_class):
            return value
        
        # If not an instance, try to create an instance from a dict
        if isinstance(value, dict):
            try:
                return self.model_class(**value)
            except ValidationError as e:
                # Convert Pydantic validation error to TraitError
                raise TraitError(f'Could not parse input as a valid {self.model_class.__name__} Pydantic model:\n'
                f'{textwrap.indent(str(e), prefix="  ")}')
        
        raise TraitError(f'Input must be a valid {self.model_class.__name__} Pydantic model or dict object, but got {value}.')
    

class JAppsConfig(SingletonConfigurable):
    apps_auth_type = Enum(
        values=["oauth", "none"],
        default_value="oauth",
        help="Authentication for deployed apps, either",
    ).tag(config=True)

    python_exec = Unicode(
        "python", help="Python executable to use for running all the commands"
    ).tag(config=True)

    app_title = Unicode(
        "JHub Apps Launcher",
        help="Title to display on the Home Page of JHub Apps Launcher",
    ).tag(config=True)

    app_icon = Unicode(
        "https://jupyter.org/assets/homepage/main-logo.svg",
        help="Icon to display on the Home Page of JHub Apps Launcher",
    ).tag(config=True)

    conda_envs = Union(
        [List(trait=Unicode, default_value=[], minlen=0), Callable()],
        help="""
        A list of conda environment names for the app creator to display as dropdown to select.
        Default value is the empty list. Also accepts conda_envs to be a callable function
        which is evaluated for each render of the create app page.
        """,
    ).tag(config=True)

    # This is to make sure that JupyterHub config is accessible inside services
    # There is no way to get JupyterHub config inside services otherwise.
    jupyterhub_config_path = Unicode(
        "jupyterhub_config.py",
        help="Path to JupyterHub config file.",
    ).tag(config=True)

    hub_host = Unicode(
        "127.0.0.1",
        help="Hub Host name, in k8s environment it would be the container name, e.g. 'hub'",
    ).tag(config=True)

    service_workers = Integer(
        2,
        help="The number of workers to create for the JHub Apps FastAPI service",
    ).tag(config=True)

    allowed_frameworks = List(
        None,
        help="Allow only a specific set of frameworks to spun up apps.",
        default_value=None,
        allow_none=True,
    ).tag(config=True)

    blocked_frameworks = List(
        None,
        help="Disallow a set of frameworks to avoid spinning up apps using those frameworks",
        default_value=None,
        allow_none=True,
    ).tag(config=True)

    startup_apps = List(
        trait=PydanticModelTrait(StartupApp),
        description="Add a server if not already created or edit an existing one to match the config. Removing items from this list won't delete any servers.",
        default_value=[],
        help="List of apps to start on JHub Apps Launcher startup",
    ).tag(config=True)
