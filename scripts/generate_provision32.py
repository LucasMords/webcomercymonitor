"""
Blender Python Script — ProVision 32
================================================
32" 4K IPS Black professional workstation monitor
Graphite gray | Ergonomic stand | Dell UltraSharp inspired

Usage:
  blender --background --python generate_provision32.py
"""

import bpy
import math
import os

SCREEN_WIDTH = 0.708
SCREEN_HEIGHT = 0.398
BACK_DEPTH = 0.030
STAND_HEIGHT = 0.270
OUTPUT_PATH = r"C:\Lucas\WebcomercyMonitor\public\models\ProVision32.glb"

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for m in bpy.data.materials: bpy.data.materials.remove(m)
for m in bpy.data.meshes: bpy.data.meshes.remove(m)

def mat(name, color, rough=0.5, metal=0.0):
    m = bpy.data.materials.new(name=name)
    m.use_nodes = True
    nodes = m.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    out = nodes.new('ShaderNodeOutputMaterial')
    m.node_tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return m

mat_screen = mat("Screen", (0.08, 0.08, 0.12), 0.05, 0.0)
mat_body = mat("Graphite", (0.18, 0.18, 0.18), 0.3, 0.15)
mat_stand = mat("StandMetal", (0.22, 0.22, 0.23), 0.15, 0.9)
mat_accent = mat("Accent", (0.93, 0.3, 0.6), 0.15, 0.4)
mat_base = mat("BaseMetal", (0.18, 0.18, 0.19), 0.2, 0.8)

# Screen
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
screen = bpy.context.active_object
screen.scale = (SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 1)
screen.data.materials.append(mat_screen)
screen.name = "Screen"

# Bezel
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.002))
bezel = bpy.context.active_object
bezel.scale = (SCREEN_WIDTH/2 + 0.003, SCREEN_HEIGHT/2 + 0.003, 0.001)
bezel.data.materials.append(mat_body)
bezel.name = "Bezel"

# Back
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -BACK_DEPTH/2))
back = bpy.context.active_object
back.scale = (SCREEN_WIDTH * 0.46, SCREEN_HEIGHT * 0.42, BACK_DEPTH/2)
back.data.materials.append(mat_body)
back.name = "BackHousing"

# OSD nub
bpy.ops.mesh.primitive_cube_add(size=0.012, location=(SCREEN_WIDTH * 0.3, -SCREEN_HEIGHT * 0.38, -BACK_DEPTH))
nub = bpy.context.active_object
nub.data.materials.append(mat_body)
nub.name = "OSD"

# Professional wide stand base
bpy.ops.mesh.primitive_cylinder_add(radius=SCREEN_WIDTH * 0.12, depth=0.01, location=(0, -SCREEN_HEIGHT/2 - STAND_HEIGHT * 0.45, 0))
col = bpy.context.active_object
col.data.materials.append(mat_stand)
col.name = "Neck"

# Base platform
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -SCREEN_HEIGHT/2 - STAND_HEIGHT, 0))
base_plate = bpy.context.active_object
base_plate.scale = (SCREEN_WIDTH * 0.5, 0.007, SCREEN_WIDTH * 0.25)
base_plate.data.materials.append(mat_base)
base_plate.name = "Base"

# Accent line on base
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -SCREEN_HEIGHT/2 - STAND_HEIGHT + 0.005, 0))
accent_line = bpy.context.active_object
accent_line.scale = (SCREEN_WIDTH * 0.08, 0.001, SCREEN_WIDTH * 0.06)
accent_line.data.materials.append(mat_accent)
accent_line.name = "AccentLine"

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

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = bpy.data.objects[0]
bpy.ops.object.join()
final = bpy.context.active_object
final.name = "ProVision32"

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.quads_convert_to_tris()
bpy.ops.object.mode_set(mode='OBJECT')

tri_count = len(final.data.polygons)
print(f"Triangles: {tri_count}")
if tri_count > 30000:
    mod = final.modifiers.new(name="Dec", type='DECIMATE')
    mod.ratio = 30000 / tri_count
    bpy.ops.object.modifier_apply(modifier="Dec")

bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH, export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_image_format='NONE', export_materials='EXPORT',
    export_apply=True, use_selection=True,
)
size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
print(f"Done! {OUTPUT_PATH} ({size_mb:.2f} MB)")
