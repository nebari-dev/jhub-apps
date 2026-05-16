from jhub_apps.version import get_version

LOGO = "/services/japps/static/img/Nebari-Logo-Horizontal-Lockup-Black-text.svg"
FAVICON = "/services/japps/static/favicon.ico"

DEFAULT_FONT_FAMILY = "'Inter', sans-serif"
DEFAULT_FONT_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=Inter:wght@300;400;500;600;700&display=swap"
)

DEFAULT_THEME = {
    "logo": LOGO,
    "favicon": FAVICON,
    "font_family": DEFAULT_FONT_FAMILY,
    "font_url": DEFAULT_FONT_URL,
    "primary_color": "#ba18da",
    "primary_color_light": "#BA18DA10",
    "primary_color_dark": "#9b00ce",
    "secondary_color": "#18817a",
    "secondary_color_dark": "#12635e",
    "accent_color": "#eda61d",
    "accent_color_dark": "#a16d14",
    "text_color": "#1c1d26",
    "h1_color": "#0f1015",
    "h2_color": "#0f1015",
    "navbar_text_color": "#2E2F33",
    "navbar_hover_color": "#00000008",
    "navbar_color": "#ffffff",
    "version": get_version(),
}
