"""
Blender Script — Generate All 10 Monitor GLBs
==============================================
Run: blender --background --python generate_all_monitors.py
"""

import bpy
import math
import os

BASE = r"C:\Lucas\WebcomercyMonitor\public\models"

MONITORS = [
    dict(id="Titan45OLED",     w=1.052, h=0.437, curve=0.800, stand='gaming',       body=(0.1,0.1,0.1),   accent=(0.96,0.27,0.37), desc="45 OLED 21:9 800R"),
    dict(id="UltraView49",     w=1.200, h=0.375, curve=0.900, stand='professional',  body=(0.1,0.1,0.1),   accent=(0.39,0.40,0.95), desc="49 QD-OLED 32:9 1800R"),
    dict(id="Spectra32OLED",   w=0.708, h=0.398, curve=0,     stand='minimalist',    body=(0.23,0.23,0.23),accent=(0.66,0.57,0.98), desc="32 4K OLED flat"),
    dict(id="ProVision32",     w=0.708, h=0.398, curve=0,     stand='professional',  body=(0.18,0.18,0.18),accent=(0.93,0.30,0.60), desc="32 4K IPS Black flat"),
    dict(id="Panorama38",      w=0.890, h=0.381, curve=1.150, stand='arm',           body=(0.94,0.94,0.94),accent=(0.08,0.73,0.65), desc="38 Nano IPS 21:9 2300R"),
    dict(id="LuxView27",       w=0.598, h=0.336, curve=0,     stand='minimalist',    body=(0.78,0.78,0.78),accent=(0.96,0.62,0.04), desc="27 Mini-LED 4K flat"),
    dict(id="CurvePro34",      w=0.790, h=0.338, curve=0.750, stand='fixed',         body=(0.75,0.75,0.75),accent=(0.55,0.36,0.96), desc="34 VA 21:9 1500R"),
    dict(id="Artisan27",       w=0.598, h=0.336, curve=0,     stand='arm',           body=(0.98,0.98,0.98),accent=(0.02,0.71,0.83), desc="27 5K Retina flat"),
    dict(id="Blitz27",         w=0.598, h=0.336, curve=0,     stand='gaming',        body=(0.07,0.07,0.07),accent=(0.96,0.27,0.37), desc="27 IPS 360Hz flat"),
    dict(id="Nitro24",         w=0.532, h=0.299, curve=0,     stand='gaming',        body=(0.05,0.05,0.05),accent=(0.13,0.77,0.37), desc="24.5 TN 540Hz flat"),
]

def mat(name, color, rough=0.5, metal=0.0, emit=None, emit_str=0):
    m = bpy.data.materials.new(name=name)
    m.use_nodes = True
    nodes = m.node_tree.nodes; nodes.clear()
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
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

def create_screen(w, h, curve_r):
    if curve_r > 0:
        angle = w / curve_r
        half = angle / 2
        segs = 48
        rows = 4
        verts, faces = [], []
        for i in range(segs + 1):
            t = i / segs
            a = (t - 0.5) * angle
            x = math.sin(a) * curve_r - math.sin(-half) * curve_r
            z = (math.cos(a) - 1) * curve_r
            for j in range(rows + 1):
                s = j / rows
                y = (s - 0.5) * h
                verts.append((x, y, z))
        cols = segs + 1
        for i in range(segs):
            for j in range(rows):
                a = i * (rows+1) + j
                b = a + rows + 1; c = b + 1; d = a + 1
                faces.append((a, b, c, d))
        mesh = bpy.data.meshes.new("Screen")
        obj = bpy.data.objects.new("Screen", mesh)
        bpy.context.collection.objects.link(obj)
        mesh.from_pydata(verts, [], faces)
        mesh.update(calc_edges=True)
        mesh.polygons.foreach_set("use_smooth", [True] * len(mesh.polygons))
        return obj
    else:
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0,0,0))
        obj = bpy.context.active_object
        obj.scale = (w/2, h/2, 1)
        return obj

def make_bezel(screen_obj, w, h, curve_r, depth=0.002):
    if curve_r > 0:
        bez = create_screen(w + 0.005, h + 0.005, curve_r)
        bez.location.z = -depth
        return bez
    else:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0,0,-depth))
        bez = bpy.context.active_object
        bez.scale = (w/2 + 0.003, h/2 + 0.003, 0.001)
        return bez

def make_back(w, h, depth=0.025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -depth/2))
    back = bpy.context.active_object
    back.scale = (w * 0.42, h * 0.38, depth/2)
    return back

def make_stand_fixed(w, h):
    stand_h = 0.28
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h*0.4, 0))
    col = bpy.context.active_object
    col.scale = (0.03, stand_h*0.4, 0.02)
    bpy.ops.mesh.primitive_cylinder_add(radius=w*0.1, depth=0.008, location=(0, -h/2 - stand_h*0.78, 0))
    bpy.ops.mesh.primitive_cylinder_add(radius=w*0.08, depth=0.003, location=(0, -h/2 - stand_h*0.78 + 0.004, 0))
    return col

def make_stand_gaming(w, h):
    stand_h = 0.28
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h*0.35, 0))
    col = bpy.context.active_object
    col.scale = (0.04, stand_h*0.35, 0.04)
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h*0.68, 0))
        leg = bpy.context.active_object
        leg.scale = (0.02, 0.014, stand_h*1.3)
        leg.rotation_euler.z = side * 0.55
        leg.name = f"Leg_{side}"
    bpy.ops.mesh.primitive_cylinder_add(radius=w*0.12, depth=0.006, location=(0, -h/2 - stand_h*0.88, 0))
    return col

def make_stand_professional(w, h):
    stand_h = 0.27
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h*0.5, 0))
    col = bpy.context.active_object
    col.scale = (0.02, stand_h*0.5, 0.015)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h, 0))
    base = bpy.context.active_object
    base.scale = (w*0.45, 0.006, w*0.22)
    return col

def make_stand_arm(w, h):
    stand_h = 0.26
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h*0.3, 0.01))
    col = bpy.context.active_object
    col.scale = (0.03, stand_h*0.3, 0.04)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h*0.6, 0.01))
    arm = bpy.context.active_object
    arm.scale = (0.015, stand_h*0.35, 0.015)
    arm.rotation_euler.x = -0.4
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h*0.88, 0))
    base = bpy.context.active_object
    base.scale = (w*0.22, 0.005, w*0.22)
    return col

def make_stand_minimalist(w, h):
    stand_h = 0.24
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h*0.45, 0))
    col = bpy.context.active_object
    col.scale = (0.015, stand_h*0.45, 0.01)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -h/2 - stand_h*0.88, 0))
    base = bpy.context.active_object
    base.scale = (w*0.35, 0.004, w*0.15)
    return col

def generate(m):
    clear_scene()
    print(f"  Generating {m['id']} ({m['desc']})...")

    m_screen = mat("Screen", (0.08,0.08,0.12), 0.05, 0.0, emit=(0.1,0.1,0.2), emit_str=0.3)
    m_body = mat("Body", m['body'], 0.45 if m['body'][0] < 0.2 else 0.25, 0.1)
    m_stand = mat("Stand", (0.15,0.15,0.16), 0.2, 0.88)
    m_accent = mat("Accent", m['accent'], 0.2, 0.4, emit=m['accent'], emit_str=0.5)
    m_base = mat("Base", (0.1,0.1,0.11), 0.25, 0.8)

    # Screen
    screen = create_screen(m['w'], m['h'], m['curve'])
    screen.data.materials.append(m_screen)
    screen.name = "Screen"

    # Bezel
    bezel = make_bezel(screen, m['w'], m['h'], m['curve'])
    bezel.data.materials.append(m_body)
    bezel.name = "Bezel"

    # Back
    back = make_back(m['w'], m['h'])
    back.data.materials.append(m_body)
    back.name = "Back"

    # Connector
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -m['h']*0.2, -0.02))
    conn = bpy.context.active_object
    conn.scale = (0.06, 0.06, 0.01)
    conn.data.materials.append(m_body)
    conn.name = "Connector"

    # Stand
    stands = {'fixed': make_stand_fixed, 'gaming': make_stand_gaming,
              'professional': make_stand_professional, 'arm': make_stand_arm,
              'minimalist': make_stand_minimalist}
    stand_col = stands.get(m['stand'], make_stand_fixed)(m['w'], m['h'])

    # Assign materials to stand/base objects
    for obj in list(bpy.data.objects):
        if obj.type != 'MESH': continue
        if obj == screen: continue
        name = obj.name.lower()
        if 'leg' in name:
            if obj.data.materials: obj.data.materials[0] = m_stand
            else: obj.data.materials.append(m_stand)
        elif 'cylinder' in obj.type and obj not in [screen, bezel, back, conn, stand_col]:
            if obj.data.materials: obj.data.materials[0] = m_base
            else: obj.data.materials.append(m_base)
        elif obj not in [screen, bezel, back, conn]:
            if obj.data.materials: obj.data.materials[0] = m_stand
            else: obj.data.materials.append(m_stand)

    if stand_col and not stand_col.data.materials:
        stand_col.data.materials.append(m_stand)

    # UV
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.mesh.select_all(action='SELECT')
            bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.003)
            bpy.ops.object.mode_set(mode='OBJECT')
            obj.select_set(False)

    # Apply transforms
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Join
    bpy.ops.object.select_all(action='SELECT')
    bpy.context.view_layer.objects.active = bpy.data.objects[0]
    bpy.ops.object.join()
    final = bpy.context.active_object
    final.name = m['id']

    # Triangulate
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.quads_convert_to_tris()
    bpy.ops.object.mode_set(mode='OBJECT')

    tris = len(final.data.polygons)
    print(f"    Triangles: {tris}")

    # Export
    path = os.path.join(BASE, f"{m['id']}.glb")
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB',
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_image_format='NONE', export_materials='EXPORT',
        export_apply=True, use_selection=True,
    )
    size = os.path.getsize(path) / (1024*1024)
    print(f"    Exported: {size:.2f} MB")
    return tris

print("=" * 50)
print("Generating ALL 10 monitor GLBs...")
print("=" * 50)
for m in MONITORS:
    generate(m)

print("=" * 50)
print("Done! All GLBs in", BASE)

# Show files
for m in MONITORS:
    path = os.path.join(BASE, f"{m['id']}.glb")
    if os.path.exists(path):
        size = os.path.getsize(path) / (1024*1024)
        print(f"  {m['id']}.glb  {size:.2f} MB")
