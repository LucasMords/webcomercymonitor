"""
Blender Script — High Quality Monitor GLBs
===========================================
Each monitor: chamfered bezels, back ports, cable cutout,
detailed stands, PBR materials. Target 5k-15k tris each.
"""

import bpy, math, os, sys

BASE = r"C:\Lucas\WebcomercyMonitor\public\models"
SEGMENTS = 64  # curve resolution

MONITORS = [
    dict(id="Titan45OLED",     w=1.052, h=0.437, curve=0.800, stand='gaming',       body=(0.1,0.1,0.1),   accent=(0.96,0.27,0.37), bezel_color=(0.06,0.06,0.07)),
    dict(id="UltraView49",     w=1.200, h=0.375, curve=0.900, stand='professional',  body=(0.1,0.1,0.1),   accent=(0.39,0.40,0.95), bezel_color=(0.06,0.06,0.07)),
    dict(id="Spectra32OLED",   w=0.708, h=0.398, curve=0,     stand='minimalist',    body=(0.23,0.23,0.23),accent=(0.66,0.57,0.98), bezel_color=(0.2,0.2,0.2)),
    dict(id="ProVision32",     w=0.708, h=0.398, curve=0,     stand='professional',  body=(0.18,0.18,0.18),accent=(0.93,0.30,0.60), bezel_color=(0.15,0.15,0.15)),
    dict(id="Panorama38",      w=0.890, h=0.381, curve=1.150, stand='arm',           body=(0.94,0.94,0.94),accent=(0.08,0.73,0.65), bezel_color=(0.92,0.92,0.92)),
    dict(id="LuxView27",       w=0.598, h=0.336, curve=0,     stand='minimalist',    body=(0.78,0.78,0.78),accent=(0.96,0.62,0.04), bezel_color=(0.72,0.72,0.72)),
    dict(id="CurvePro34",      w=0.790, h=0.338, curve=0.750, stand='fixed',         body=(0.75,0.75,0.75),accent=(0.55,0.36,0.96), bezel_color=(0.7,0.7,0.7)),
    dict(id="Artisan27",       w=0.598, h=0.336, curve=0,     stand='arm',           body=(0.98,0.98,0.98),accent=(0.02,0.71,0.83), bezel_color=(0.96,0.96,0.96)),
    dict(id="Blitz27",         w=0.598, h=0.336, curve=0,     stand='gaming',        body=(0.07,0.07,0.07),accent=(0.96,0.27,0.37), bezel_color=(0.04,0.04,0.05)),
    dict(id="Nitro24",         w=0.532, h=0.299, curve=0,     stand='gaming',        body=(0.05,0.05,0.05),accent=(0.13,0.77,0.37), bezel_color=(0.03,0.03,0.04)),
]

# ================== HELPERS ==================

def mat(name, color, rough=0.5, metal=0.0, emit=None, emit_str=0, clearcoat=0):
    m = bpy.data.materials.new(name=name)
    m.use_nodes = True
    nodes = m.node_tree.nodes; nodes.clear()
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    bsdf.inputs['Coat Weight'].default_value = clearcoat
    if emit:
        bsdf.inputs['Emission Color'].default_value = (*emit, 1.0)
        bsdf.inputs['Emission Strength'].default_value = emit_str
    out = nodes.new('ShaderNodeOutputMaterial')
    m.node_tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return m

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for m in bpy.data.materials: bpy.data.materials.remove(m)
    for m in bpy.data.meshes: bpy.data.meshes.remove(m)

def bevel(obj, amount=0.001, segments=2):
    """Add bevel modifier for chamfered edges"""
    mod = obj.modifiers.new(name="Bevel", type='BEVEL')
    mod.width = amount
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    mod.angle_limit = 0.5

def apply_modifiers(obj):
    bpy.context.view_layer.objects.active = obj
    for mod in obj.modifiers:
        bpy.ops.object.modifier_apply(modifier=mod.name)

def create_curved_surface(w, h, r, segs, depth=0.0):
    """Create curved front surface"""
    angle = w / r
    half = angle / 2
    rows = 4
    verts, faces = [], []
    for i in range(segs + 1):
        t = i / segs
        a = (t - 0.5) * angle
        x = math.sin(a) * r - math.sin(-half) * r
        z = (math.cos(a) - 1) * r + depth
        for j in range(rows + 1):
            s = j / rows
            y = (s - 0.5) * h
            verts.append((x, y, z))
    cols = segs + 1
    for i in range(segs):
        for j in range(rows):
            a_idx = i * (rows+1) + j
            b_idx = a_idx + rows + 1
            c_idx = b_idx + 1
            d_idx = a_idx + 1
            faces.append((a_idx, b_idx, c_idx, d_idx))
    mesh = bpy.data.meshes.new("Curved")
    obj = bpy.data.objects.new("Curved", mesh)
    bpy.context.collection.objects.link(obj)
    mesh.from_pydata(verts, [], faces)
    mesh.update(calc_edges=True)
    mesh.polygons.foreach_set("use_smooth", [True] * len(mesh.polygons))
    return obj

def make_monitor_body(m, m_screen, m_bezel, m_body, m_accent, m_stand, m_base):
    w, h, crv = m['w'], m['h'], m['curve']

    # Screen surface
    if crv > 0:
        screen = create_curved_surface(w, h, crv, SEGMENTS, 0.0)
    else:
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0.001))
        screen = bpy.context.active_object
        screen.scale = (w/2, h/2, 1)
    screen.data.materials.append(m_screen)
    screen.name = "Screen"

    # Bezel frame (surrounding screen, slightly bigger, behind it)
    bw = w + 0.006
    bh = h + 0.006
    if crv > 0:
        bezel = create_curved_surface(bw, bh, crv, SEGMENTS, -0.002)
    else:
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, -0.001))
        bezel = bpy.context.active_object
        bezel.scale = (bw/2, bh/2, 1)
    bezel.data.materials.append(m_bezel)
    bezel.name = "Bezel"

    # Back housing - rounded bulge
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.018))
    back = bpy.context.active_object
    back.scale = (w * 0.44, h * 0.4, 0.014)
    back.name = "BackHousing"
    back.data.materials.append(m_body)
    bevel(back, 0.004, 3)

    # Bottom chin (brand bar) - thicker at bottom
    chin_h = h * 0.055
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 + chin_h/2, 0.002))
    chin = bpy.context.active_object
    chin.scale = (w/2 + 0.002, chin_h/2, 0.003)
    chin.name = "Chin"
    chin.data.materials.append(m_body)
    bevel(chin, 0.001, 1)

    # Logo indent on chin
    logo_w = w * 0.08
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 + chin_h/2, 0.005))
    logo = bpy.context.active_object
    logo.scale = (logo_w/2, chin_h * 0.35, 0.0005)
    logo.name = "Logo"
    logo.data.materials.append(m_accent)

    # Back ports area
    port_y = -h * 0.15
    bpy.ops.mesh.primitive_cube_add(size=1, location=(w * 0.8, port_y, -0.03))
    ports = bpy.context.active_object
    ports.scale = (0.06, 0.04, 0.004)
    ports.name = "Ports"
    ports.data.materials.append(m_body)

    # Ventilation slits on back
    for i in range(5):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h * 0.05 + i * h * 0.04, -0.028))
        slit = bpy.context.active_object
        slit.scale = (w * 0.25, 0.002, 0.002)
        slit.name = f"Vent_{i}"
        slit.data.materials.append(m_body)

    # OSD joystick nub (bottom edge)
    bpy.ops.mesh.primitive_cube_add(size=0.008, location=(w * 0.3, -h/2 + 0.005, -0.01))
    nub = bpy.context.active_object
    nub.name = "OSD"
    nub.data.materials.append(m_body)

    # Cable management cutout
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2, -0.04))
    cable = bpy.context.active_object
    cable.scale = (w * 0.15, 0.015, 0.006)
    cable.name = "CableCutout"
    cable.data.materials.append(m_body)

    return screen

def make_stand(m):
    w, h, st = m['w'], m['h'], m['stand']
    stand_h = 0.26

    if st == 'gaming':
        # Central column
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.3, 0.002))
        col = bpy.context.active_object
        col.scale = (0.025, stand_h * 0.3, 0.025)
        col.name = "Column"
        # V legs
        for side in [-1, 1]:
            bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.55, 0.002))
            leg = bpy.context.active_object
            leg.scale = (0.018, 0.012, stand_h * 1.2)
            leg.rotation_euler.z = side * 0.5
            leg.name = f"Leg_{'R' if side > 0 else 'L'}"
            bevel(leg, 0.002, 2)
            # Accent foot
            bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.55 - stand_h * 0.35, 0.002))
            foot = bpy.context.active_object
            foot.scale = (0.02, 0.02, 0.02)
            foot.rotation_euler.z = side * 0.5
            foot.name = f"Foot_{'R' if side > 0 else 'L'}"
        # Base plate
        bpy.ops.mesh.primitive_cylinder_add(radius=w * 0.13, depth=0.006, location=(0, -h/2 - stand_h * 0.85, 0))
        base = bpy.context.active_object
        base.name = "Base"
        bevel(base, 0.002, 2)

    elif st == 'professional':
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.45, 0.003))
        col = bpy.context.active_object
        col.scale = (0.015, stand_h * 0.45, 0.012)
        col.name = "Col"
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.9, 0))
        base = bpy.context.active_object
        base.scale = (w * 0.48, 0.006, w * 0.24)
        base.name = "Base"
        bevel(base, 0.004, 3)
        # Accent strip
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.9 + 0.004, 0))
        strip = bpy.context.active_object
        strip.scale = (w * 0.1, 0.001, w * 0.06)
        strip.name = "AccentStrip"

    elif st == 'arm':
        # VESA plate
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.006))
        vesa = bpy.context.active_object
        vesa.scale = (0.05, 0.05, 0.003)
        vesa.name = "VESA"
        # Upper arm
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.25, 0.008))
        arm1 = bpy.context.active_object
        arm1.scale = (0.012, stand_h * 0.28, 0.012)
        arm1.rotation_euler.x = -0.3
        arm1.name = "UpperArm"
        # Joint
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012, location=(0, -h/2 - stand_h * 0.5, 0.008))
        joint = bpy.context.active_object
        joint.name = "Joint"
        # Lower arm
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.5, 0.008))
        arm2 = bpy.context.active_object
        arm2.scale = (0.012, stand_h * 0.35, 0.012)
        arm2.rotation_euler.x = 0.5
        arm2.name = "LowerArm"
        # Base
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.88, 0))
        base = bpy.context.active_object
        base.scale = (w * 0.22, 0.005, w * 0.22)
        base.name = "Base"
        bevel(base, 0.003, 2)

    elif st == 'minimalist':
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.4, 0.002))
        col = bpy.context.active_object
        col.scale = (0.012, stand_h * 0.4, 0.008)
        col.name = "Col"
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h * 0.82, 0))
        base = bpy.context.active_object
        base.scale = (w * 0.38, 0.004, w * 0.16)
        base.name = "Base"
        bevel(base, 0.004, 3)

    else:  # fixed
        bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=stand_h * 0.65, location=(0, -h/2 - stand_h * 0.35, 0.005))
        col = bpy.context.active_object
        col.name = "Col"
        bpy.ops.mesh.primitive_cylinder_add(radius=w * 0.1, depth=0.006, location=(0, -h/2 - stand_h * 0.7, 0))
        base = bpy.context.active_object
        base.name = "Base"
        bevel(base, 0.002, 2)
        bpy.ops.mesh.primitive_cylinder_add(radius=w * 0.08, depth=0.003, location=(0, -h/2 - stand_h * 0.7 + 0.003, 0))
        ring = bpy.context.active_object
        ring.name = "AccentRing"

def assign_materials(m, m_screen, m_bezel, m_body, m_accent, m_stand, m_base):
    """Auto-assign materials by object name"""
    for obj in bpy.data.objects:
        if obj.type != 'MESH': continue
        name = obj.name.lower()
        data = obj.data
        if not data.materials:
            data.materials.append(m_body)

        if 'screen' in name:
            data.materials[0] = m_screen
        elif 'bezel' in name:
            data.materials[0] = m_bezel
        elif any(k in name for k in ('leg', 'foot', 'col', 'vesa', 'arm', 'joint', 'base', 'strip', 'ring')):
            if 'accent' in name or 'strip' in name or 'ring' in name or 'foot' in name:
                data.materials[0] = m_accent
            elif 'base' in name:
                data.materials[0] = m_base
            else:
                data.materials[0] = m_stand
        elif any(k in name for k in ('back', 'chin', 'port', 'vent', 'cable', 'osd', 'nub', 'logo')):
            if 'logo' in name:
                data.materials[0] = m_accent
            else:
                data.materials[0] = m_body
        else:
            data.materials[0] = m_body

def export_glb(m, join_first=True):
    """Export to GLB with Draco"""
    # Apply all modifiers
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            for mod in obj.modifiers:
                try: bpy.ops.object.modifier_apply(modifier=mod.name)
                except: pass
            obj.select_set(False)

    # UV unwrap
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.mesh.select_all(action='SELECT')
            bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.004)
            bpy.ops.object.mode_set(mode='OBJECT')
            obj.select_set(False)

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    if join_first:
        bpy.ops.object.select_all(action='SELECT')
        bpy.context.view_layer.objects.active = bpy.data.objects[0]
        bpy.ops.object.join()
        final = bpy.context.active_object
        final.name = m['id']
    else:
        final = bpy.context.active_object

    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.quads_convert_to_tris()
    bpy.ops.object.mode_set(mode='OBJECT')

    tris = len(final.data.polygons)
    print(f"    Tris: {tris}")

    path = os.path.join(BASE, f"{m['id']}.glb")
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB',
      export_draco_mesh_compression_enable=False,
        export_image_format='NONE', export_materials='EXPORT',
        export_apply=True, use_selection=True,
    )
    size = os.path.getsize(path) / (1024*1024)
    print(f"    Exported: {size:.2f} MB")
    return tris

# ================== MAIN ==================

print("=" * 55)
print("HIGH QUALITY MONITOR GLBs — chamfered edges, details")
print("=" * 55)

for m in MONITORS:
    print(f"\n  {m['id']} ({m['desc'] if 'desc' in m else ''})")
    clear_scene()

    m_screen = mat("Screen", (0.04,0.04,0.06), 0.1, 0.0, emit=(0.08,0.08,0.15), emit_str=0.4, clearcoat=0.3)
    m_bezel  = mat("Bezel", m['bezel_color'], 0.35, 0.05)
    m_body   = mat("Body", m['body'], 0.4, 0.08)
    m_accent = mat("Accent", m['accent'], 0.15, 0.4, emit=m['accent'], emit_str=0.6)
    m_stand  = mat("Stand", (0.14,0.14,0.15), 0.2, 0.85)
    m_base   = mat("Base", (0.09,0.09,0.1), 0.25, 0.78)

    make_monitor_body(m, m_screen, m_bezel, m_body, m_accent, m_stand, m_base)
    make_stand(m)
    assign_materials(m, m_screen, m_bezel, m_body, m_accent, m_stand, m_base)
    export_glb(m, join_first=True)

print("\n" + "=" * 55)
print("DONE! Models in", BASE)
for m in MONITORS:
    p = os.path.join(BASE, f"{m['id']}.glb")
    if os.path.exists(p):
        print(f"  {m['id']}.glb  {os.path.getsize(p)/1024:.1f} KB")
