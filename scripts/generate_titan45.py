"""
Blender Python Script — Titan 45 OLED Monitor
================================================
45" 21:9 curved gaming monitor
800R curvature | OLED panel | Aggressive gaming stand

Usage:
  blender --background --python generate_titan45.py

Output:
  Titan45OLED.glb (Draco compressed, <40k tris, PBR materials)
"""

import bpy
import math
import os

# ====================================================
# CONFIG
# ====================================================
SCREEN_WIDTH = 1.052   # 45" 21:9 display width in meters
SCREEN_HEIGHT = 0.437  # display height
CURVE_RADIUS = 0.800   # 800R curvature
BEZEL_THICKNESS = 0.002
BACK_DEPTH = 0.028
STAND_HEIGHT = 0.280
OUTPUT_PATH = r"C:\Lucas\WebcomercyMonitor\public\models\Titan45OLED.glb"

# ====================================================
# CLEAR SCENE
# ====================================================
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Remove default materials and meshes
for m in bpy.data.materials:
    bpy.data.materials.remove(m)
for m in bpy.data.meshes:
    bpy.data.meshes.remove(m)

# ====================================================
# MATERIALS (PBR)
# ====================================================
def create_material(name, base_color, roughness=0.5, metallic=0.0, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()

    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (*base_color, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    if emission_color and emission_strength > 0:
        bsdf.inputs['Emission Color'].default_value = (*emission_color, 1.0)
        bsdf.inputs['Emission Strength'].default_value = emission_strength

    output = nodes.new('ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

# Screen: deep black with slight emission
mat_screen = create_material("Screen", (0.08, 0.08, 0.12), roughness=0.05, metallic=0.0, emission_color=(0.1, 0.1, 0.2), emission_strength=0.3)

# Body: carbon black matte
mat_body = create_material("Body_Matt", (0.1, 0.1, 0.1), roughness=0.55, metallic=0.05)

# Stand: dark metal
mat_stand = create_material("Stand_Metal", (0.15, 0.15, 0.15), roughness=0.25, metallic=0.85)

# Accent: red gaming detail
mat_accent = create_material("Accent_Red", (0.96, 0.27, 0.37), roughness=0.2, metallic=0.4, emission_color=(0.96, 0.27, 0.37), emission_strength=0.5)

# Base bottom
mat_base = create_material("Base_Dark", (0.08, 0.08, 0.09), roughness=0.3, metallic=0.7)

# ====================================================
# CURVED SCREEN GEOMETRY
# ====================================================
def create_curved_screen(width, height, radius, segments=48):
    """Create a curved screen mesh following an arc"""
    angle = width / radius
    half_angle = angle / 2
    seg_h = 4

    verts = []
    faces = []

    for i in range(segments + 1):
        t = i / segments
        a = (t - 0.5) * angle
        x = math.sin(a) * radius - math.sin(-half_angle) * radius
        z = (math.cos(a) - 1) * radius
        # front and back
        for j in range(seg_h + 1):
            s = j / seg_h
            y = (s - 0.5) * height
            verts.append((x, y, z))

    cols = segments + 1
    rows = seg_h + 1

    for i in range(segments):
        for j in range(seg_h):
            a = i * rows + j
            b = a + rows
            c = b + 1
            d = a + 1
            faces.append((a, b, c, d))

    mesh = bpy.data.meshes.new("CurvedScreen")
    obj = bpy.data.objects.new("Screen", mesh)
    bpy.context.collection.objects.link(obj)
    mesh.from_pydata(verts, [], faces)
    mesh.update(calc_edges=True)
    mesh.polygons.foreach_set("use_smooth", [True] * len(mesh.polygons))
    return obj

# ====================================================
# BEZEL (extruded from screen edge)
# ====================================================
def create_bezel(screen_obj, bezel_w, depth):
    """Create bezel around screen by duplicating edge and extruding"""
    bpy.context.view_layer.objects.active = screen_obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.extrude_region_move(MOVE_AMOUNT=(0, 0, depth))
    bpy.ops.transform.shrink_fatten(value=bezel_w, use_even_offset=True)
    bpy.ops.object.mode_set(mode='OBJECT')
    return screen_obj

# ====================================================
# BACK HOUSING
# ====================================================
def create_back_housing(screen_obj, depth):
    """Create back bulge from screen center"""
    bpy.context.view_layer.objects.active = screen_obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.region_to_loop()
    bpy.ops.mesh.fill()
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.extrude_region_move(MOVE_AMOUNT=(0, 0, -depth * 1.5))
    bpy.ops.transform.shrink_fatten(value=-0.01)
    bpy.ops.object.mode_set(mode='OBJECT')
    return screen_obj

# ====================================================
# V-SHAPED GAMING STAND
# ====================================================
def create_gaming_stand(parent_obj, height):
    """Create aggressive V-shaped gaming stand"""
    screen_w = SCREEN_WIDTH
    screen_h = SCREEN_HEIGHT

    # Neck plate (attaches to monitor)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -screen_h/2, 0.01))
    neck_plate = bpy.context.active_object
    neck_plate.scale = (0.22, 0.01, 0.16)
    neck_plate.name = "NeckPlate"
    neck_plate.data.materials.append(mat_stand)

    # Main column
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -screen_h/2 - height * 0.35, 0.01))
    column = bpy.context.active_object
    column.scale = (0.06, height * 0.35, 0.05)
    column.name = "StandColumn"
    column.data.materials.append(mat_stand)

    # V-shaped legs
    leg_length = height * 1.5
    leg_width = 0.025
    leg_height = 0.018
    leg_angle = 0.55  # radians

    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
        leg = bpy.context.active_object
        leg.scale = (leg_width, leg_height, leg_length)
        leg.rotation_euler = (0, 0, side * leg_angle)
        leg.location = (0, -screen_h/2 - height * 0.7, 0.01)
        leg.name = f"Leg_{'R' if side > 0 else 'L'}"
        leg.data.materials.append(mat_stand)

        # Accent tip at end of leg
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -screen_h/2 - height * 0.7 - leg_length * 0.35, 0.01))
        accent = bpy.context.active_object
        accent.scale = (leg_width * 1.2, leg_height * 2.5, leg_height * 2.5)
        accent.rotation_euler = (0, 0, side * leg_angle)
        accent.name = f"AccentTip_{'R' if side > 0 else 'L'}"
        accent.data.materials.append(mat_accent)

    # Base plate
    bpy.ops.mesh.primitive_cylinder_add(radius=screen_w * 0.15, depth=0.008, location=(0, -screen_h/2 - height * 0.98, 0))
    base = bpy.context.active_object
    base.name = "BasePlate"
    base.data.materials.append(mat_base)

    return neck_plate

# ====================================================
# BUILD MODEL
# ====================================================
print("Building Titan 45 OLED...")

# Screen
screen = create_curved_screen(SCREEN_WIDTH, SCREEN_HEIGHT, CURVE_RADIUS, segments=48)
screen.data.materials.append(mat_screen)

# Bezel
bezel_obj = create_curved_screen(SCREEN_WIDTH + 0.008, SCREEN_HEIGHT + 0.008, CURVE_RADIUS, segments=48)
bezel_obj.location.z = -0.003  # behind screen
bezel_obj.data.materials.append(mat_body)

# Back housing - simple bulge
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.015))
back = bpy.context.active_object
back.scale = (SCREEN_WIDTH * 0.42, SCREEN_HEIGHT * 0.38, BACK_DEPTH)
back.name = "BackHousing"
back.data.materials.append(mat_body)

# Connector bump
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -SCREEN_HEIGHT * 0.2, -BACK_DEPTH * 1.5))
connector = bpy.context.active_object
connector.scale = (0.08, 0.08, 0.015)
connector.name = "Connector"
connector.data.materials.append(mat_body)

# Stand
create_gaming_stand(screen, STAND_HEIGHT)

# ====================================================
# UV UNWRAP
# ====================================================
print("UV unwrapping...")
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.003)
        bpy.ops.object.mode_set(mode='OBJECT')
        obj.select_set(False)

# ====================================================
# SET ORIGIN + APPLY TRANSFORMS
# ====================================================
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ====================================================
# MERGE INTO ONE OBJECT (optional — keeps materials)
# ====================================================
print("Joining parts...")
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = bpy.data.objects[0]
bpy.ops.object.join()

# Rename
final = bpy.context.active_object
final.name = "Titan45OLED"

# ====================================================
# TRIANGLE COUNT CHECK
# ====================================================
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.quads_convert_to_tris()
bpy.ops.object.mode_set(mode='OBJECT')
tri_count = len(final.data.polygons)
print(f"Triangle count: {tri_count}")

# Decimate if needed
if tri_count > 40000:
    ratio = 40000 / tri_count
    mod = final.modifiers.new(name="Decimate", type='DECIMATE')
    mod.ratio = ratio
    bpy.ops.object.modifier_apply(modifier="Decimate")
    print(f"Decimated to ~{len(final.data.polygons)} triangles")

# ====================================================
# EXPORT GLB
# ====================================================
print(f"Exporting to {OUTPUT_PATH}...")

bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_image_format='NONE',
    export_materials='EXPORT',
    export_apply=True,
    use_selection=True,
)

# File size
size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
print(f"Done! {OUTPUT_PATH} ({size_mb:.2f} MB)")
print(f"Triangles: {len(final.data.polygons)}")
