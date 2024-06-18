from jhub_apps.spawner.command import TString, Command


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
