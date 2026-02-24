import os
import re

image_dir = r"c:\Users\mjuik\RoguelikeRPG\assets\images"
files = os.listdir(image_dir)

# Rule: [type]_[id].png
# We want to preserve parts like 'elite', 'avatar', 'special' if they are part of IDs or conventions

def get_new_name(old_name):
    if not old_name.lower().endswith((".png", ".webp")):
        return None
    
    # Base name without extension
    base, ext = os.path.splitext(old_name)
    # Handle .png.png recursively
    while base.lower().endswith(".png"):
        base = base[:-4]
    
    # If it's something like 'card.png' or 'relic.png', it was broken by previous script
    # We might not be able to recover ID easily without timestamps
    # But let's try to match against timestamps first if they still exist in some files
    
    match = re.match(r"^([a-z]+)_(.*?)_(\d{10,})", base)
    if match:
        tag = match.group(1)
        name = match.group(2)
        
        # Clean up ONLY technical suffixes from generation
        suffixes = ["_no_text", "_special_retry", "_retry", "_final_retry", "_final", "_png"]
        for s in suffixes:
            name = name.replace(s, "")
        
        # We KEEP _elite, _boss, _avatar because they are part of the convention/ID
        name = re.sub(r'__+', '_', name).strip('_')
        
        # Specific recovery for 'avatar' if it was lost
        if tag in ["swordsman", "mage", "hunter"] or name == "avatar":
            target_class = tag if tag in ["swordsman", "mage", "hunter"] else name
            return f"avatar_{target_class}.png"
            
        return f"{tag}_{name}.png"

    # Fallback for already cleaned but slightly wrong names (like double extension or missing parts)
    parts = base.split("_")
    clean_parts = []
    for p in parts:
        if p.isdigit() and len(p) >= 10:
            break
        if p.lower() in ["no", "text", "retry", "final"]:
            continue
        clean_parts.append(p)
    
    new_base = "_".join(clean_parts).strip("_")
    
    # Recovery for broken avatar names (e.g., hunter.png -> avatar_hunter.png)
    if new_base in ["swordsman", "mage", "hunter"]:
        new_base = f"avatar_{new_base}"
    if "avatar" in new_base and "_" in new_base:
        # Ensure it's always avatar_[class]
        p = new_base.split("_")
        cls = p[0] if p[1] == "avatar" else p[1]
        new_base = f"avatar_{cls}"
    
    if not new_base:
        return None
    return f"{new_base}.png"

print(f"Scanning {image_dir}...")
rename_count = 0
for f in files:
    new_name = get_new_name(f)
    if new_name and new_name != f:
        old_path = os.path.join(image_dir, f)
        new_path = os.path.join(image_dir, new_name)
        
        # Safety: avoid overwriting if target exists
        if os.path.exists(new_path):
            print(f"Skipping {f} -> {new_name} (Target already exists)")
        else:
            os.rename(old_path, new_path)
            print(f"Renamed: {f} -> {new_name}")
            rename_count += 1

print(f"Done. Renamed {rename_count} files.")
