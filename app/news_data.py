"""
Shared news/changelog data for the Horsetranq application.
This data is used by both the news page and index page.
"""

NEWS_DATA = [
    {
        "version": "v3.0.1",
        "date": "2024-12-15",
        "date_display": "Septembar 3, 2025",
        "new_features": [
            "Horsplay Seasin 2 launch wit upcoming stor",
            "Sine in optins now allow user acount creation (no Google reqired)",
            "Aded hors movment on Horsplay for added difculty"
        ],
        "fixes": [
            "Fixe database not updatin in some case aftar Horsplay ends",
            "Fixed bug wit navgation dropdown not opening or closng",
            "Fixe bug wit player profil not loadin on clik",
            "Fixed databas not properly colectin scores from Horsplay"
        ],
        "deprecated": []
    },
    {
        "version": "v3.0.0",
        "date": "2024-11-20",
        "date_display": "Septembar 1, 2025",
        "new_features": [
            "Aded new webcite designe wit modern UI elements",
            "Aded database scor and profile detales",
            "Adde playar reporting mechanix to track hakers",
            "Aded News page to trak game updates"
        ],
        "fixes": [
            "Fixe overscrol page reload bug on Horsplay",
            "Fixd broken navgation links taht reload page",
            "Resolvd setings menu optins not saving in Horsplay"
        ],
        "deprecated": [
            "Remove old menu systim and navgation",
            "Removd old gam refernces TrotTank n Gallop Gun"
        ]
    }
]

def get_latest_features(count=3):
    """Get the latest N features across all versions."""
    all_features = []
    
    for version_data in NEWS_DATA:
        for feature in version_data["new_features"]:
            all_features.append({
                "text": feature,
                "version": version_data["version"],
                "date": version_data["date_display"]
            })
    
    return all_features[:count]

def get_latest_fixes(count=3):
    """Get the latest N fixes across all versions."""
    all_fixes = []
    
    for version_data in NEWS_DATA:
        for fix in version_data["fixes"]:
            all_fixes.append({
                "text": fix,
                "version": version_data["version"],
                "date": version_data["date_display"]
            })
    
    return all_fixes[:count]

def get_latest_deprecated(count=3):
    """Get deprecated features from the latest version only."""
    if not NEWS_DATA:
        return []
    
    latest_version = NEWS_DATA[0]
    deprecated_items = []
    
    for deprecated in latest_version["deprecated"]:
        deprecated_items.append({
            "text": deprecated,
            "version": latest_version["version"],
            "date": latest_version["date_display"]
        })
    
    return deprecated_items[:count]

def get_latest_version():
    """Get the most recent version data."""
    return NEWS_DATA[0] if NEWS_DATA else None
