from jhub_apps.version import get_version

LOGO = "/services/japps/static/img/Nebari-Logo-Horizontal-Lockup-White-text.svg"
FAVICON = "/services/japps/static/favicon.ico"

DEFAULT_THEME = {
    "logo": LOGO,
    "favicon": FAVICON,
    "primary_color": "#ba18da",
    "primary_color_dark": "#9b00ce",
    "secondary_color": "#18817a",
    "secondary_color_dark": "#12635e",
    "accent_color": "#eda61d",
    "accent_color_dark": "#a16d14",
    "text_color": "#1c1d26",
    "h1_color": "#0f1015",
    "h2_color": "#0f1015",
    "navbar_text_color": "#ffffff",
    "navbar_hover_color": "#20b1a8",
    "navbar_color": "#1c1d26",
    "version": get_version(),
}
