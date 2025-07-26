"""Script to build the NINVAX_GHOSTSHELL_v0.1 VRChat avatar using Blender's API."""

import bpy


def create_avatar(filepath: str = "/your/path/NINVAX_GHOSTSHELL_v0.1.blend") -> None:
    """Create the Ghostshell avatar and save to a .blend file."""
    # 1. Reset Blender to factory settings
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 2. Create Base Body
    # Using a simple sphere as placeholder for the body; in practice, this could
    # be replaced with a detailed human mesh via MakeHuman or manual sculpting.
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, 1))
    body = bpy.context.object
    body.name = "Body_Base"

    # 3. Organize collections
    collection = bpy.data.collections.new("NINVAX_GHOSTSHELL")
    bpy.context.scene.collection.children.link(collection)
    collection.objects.link(body)

    # 4. Add Armature
    bpy.ops.object.armature_add(enter_editmode=False, location=(0, 0, 1))
    armature = bpy.context.object
    armature.name = "Ghostshell_Armature"

    # 5. Parent Body to Rig
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')

    # 6. Create material with emissive glitch veins
    mat = bpy.data.materials.new(name="Ghostshell_Skin")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (1, 1, 1, 1)  # Porcelain white

    emission = nodes.new('ShaderNodeEmission')
    emission.inputs['Color'].default_value = (0.5, 0, 1, 1)  # Purple glitch
    emission.inputs['Strength'].default_value = 2.0

    mix = nodes.new('ShaderNodeMixShader')
    material_output = nodes.get('Material Output')

    links.new(bsdf.outputs[0], mix.inputs[1])
    links.new(emission.outputs[0], mix.inputs[2])
    links.new(mix.outputs[0], material_output.inputs[0])

    if len(body.data.materials) == 0:
        body.data.materials.append(mat)
    else:
        body.data.materials[0] = mat

    # 7. Placeholder for idle pose with hands behind back
    # Actual pose data can be authored separately and inserted here.

    # 8. Placeholder for glitch-in animation
    # Animation logic (alpha fade, pixel dispersion) can be added using keyframes
    # and shader nodes as needed.

    # 9. Save the resulting blend file
    bpy.ops.wm.save_as_mainfile(filepath=filepath)


if __name__ == "__main__":
    create_avatar()
