from jhub_apps.version import get_version

LOGO = "/services/japps/static/img/Nebari-Logo-Horizontal-Lockup-Black-text.svg"
FAVICON = "/services/japps/static/favicon.ico"

DEFAULT_FONT_FAMILY = "'Inter', sans-serif"
DEFAULT_FONT_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=Inter:wght@300;400;500;600;700&display=swap"
)

# Brand colours are intentionally absent from DEFAULT_THEME. The React UI ships
# the Nebari design-system theme (light *and* dark token sets, from the
# @nebari/theme shadcn registry item) and only overrides it with colours an
# operator sets in `c.JupyterHub.template_vars`, which reach it as CSS
# variables via /services/japps/config.json. Defaulting a single light colour
# here would force it onto dark mode too.
DEFAULT_THEME = {
    "logo": LOGO,
    "favicon": FAVICON,
    "font_family": DEFAULT_FONT_FAMILY,
    "font_url": DEFAULT_FONT_URL,
    "version": get_version(),
}

# Fallback colours for the server-rendered JupyterHub pages (login, spawn,
# admin, …), which never load the React bundle and consume the theme purely
# through /services/japps/theme.css + hub.css. sRGB hex renderings of the
# light-mode @nebari/theme tokens: primary = --primary, primary_color_dark =
# --primary-hover, primary_color_light = --primary-magenta-50, secondary =
# --accent-teal-500/700, accent = --highlight-yellow-500/700, text/headings =
# --foreground, navbar = --header / --header-foreground / --muted.
SERVER_PAGE_DEFAULT_COLORS = {
    "primary_color": "#9547c0",
    "primary_color_light": "#fbf6fe",
    "primary_color_dark": "#77399a",
    "secondary_color": "#319890",
    "secondary_color_dark": "#236762",
    "accent_color": "#a78001",
    "accent_color_dark": "#725600",
    "text_color": "#262628",
    "h1_color": "#262628",
    "h2_color": "#262628",
    "navbar_color": "#f8f8f8",
    "navbar_text_color": "#262628",
    "navbar_hover_color": "#eeeeef",
}
