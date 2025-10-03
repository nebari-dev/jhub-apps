"""
KubeSpawner profiles for testing different instance types

This file defines server profiles that users can select when creating apps.
Similar to Nebari's profile configuration but simplified for local dev.
"""

c.KubeSpawner.profile_list = [
    {
        "display_name": "Small Instance",
        "description": "1 CPU / 1 GB RAM - Good for testing lightweight apps",
        "slug": "small",
        "default": True,
        "kubespawner_override": {
            "cpu_limit": 1,
            "mem_limit": "1G",
            "cpu_guarantee": 0.1,
            "mem_guarantee": "128M",
        }
    },
    {
        "display_name": "Medium Instance",
        "description": "2 CPU / 2 GB RAM - Good for Panel/Streamlit apps",
        "slug": "medium",
        "kubespawner_override": {
            "cpu_limit": 2,
            "mem_limit": "2G",
            "cpu_guarantee": 0.5,
            "mem_guarantee": "512M",
        }
    },
    {
        "display_name": "Large Instance",
        "description": "4 CPU / 4 GB RAM - For resource-intensive apps",
        "slug": "large",
        "kubespawner_override": {
            "cpu_limit": 4,
            "mem_limit": "4G",
            "cpu_guarantee": 1,
            "mem_guarantee": "1G",
        }
    },
]

print("✅ KubeSpawner profiles loaded")
print(f"   - {len(c.KubeSpawner.profile_list)} profiles available")
for profile in c.KubeSpawner.profile_list:
    print(f"     • {profile['display_name']} ({profile['slug']})")
