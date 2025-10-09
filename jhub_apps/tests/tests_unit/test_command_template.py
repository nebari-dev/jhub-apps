from jhub_apps.spawner.command import TString, Command
from jhub_apps.spawner.spawner_creation import wrap_command_with_proxy_installer


def test_tstring():
    filepath = "foo/bar"
    assert (
        TString("random $filepath").replace(filepath=filepath) == f"random {filepath}"
    )


def test_cmd_templating():
    cmd = Command(
        args=[TString("alpha $abc"), "beta", TString("$efg"), TString("$foo $bar")]
    )
    s_args = cmd.get_substituted_args(abc="abc_", efg="_efg", foo="foo_", bar="_bar")
    assert s_args == ["alpha abc_", "beta", "_efg", "foo_ _bar"]


def test_wrap_command_with_proxy_installer():
    """Test that the wrapper correctly wraps commands with installation script"""
    cmd_list = ["jhub-app-proxy", "--authtype=oauth", "--destport=0"]
    wrapped = wrap_command_with_proxy_installer(cmd_list)

    assert len(wrapped) == 3
    assert wrapped[0] == "/bin/bash"
    assert wrapped[1] == "-c"
    assert "jhub-app-proxy" in wrapped[2]
    assert "command -v jhub-app-proxy" in wrapped[2]
    assert "curl -fsSL" in wrapped[2]
    assert "install.sh" in wrapped[2]
    assert "export PATH=" in wrapped[2]
    assert "$HOME/.local/bin" in wrapped[2]
    assert "exec jhub-app-proxy" in wrapped[2]
