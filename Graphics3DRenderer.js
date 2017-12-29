// Vertex Definition
//
// struct Vertex {
//     vec3 position;
//     vec3 normals;
//     vec2 texcoord;
// };

function Graphics3DRenderer(webglContext)
{
    this.gl = webglContext;
    this.programs = [];
    this.cachedModel = [];
    this.cachedModel[0] = mat4.create();
    this.cachedModel[1] = mat4.create();

    this.init();
}

Graphics3DRenderer.VERTEX_SIZE = Float32Array.BYTES_PER_ELEMENT * 8;
Graphics3DRenderer.VERTEX_POSITION = 0;
Graphics3DRenderer.VERTEX_NORMALS = Float32Array.BYTES_PER_ELEMENT * 3;
Graphics3DRenderer.VERTEX_TEXCOORD = Float32Array.BYTES_PER_ELEMENT * 6;
Graphics3DRenderer.SHADER_UNLIT_UNTEXTURED = 0;
Graphics3DRenderer.SHADER_LIT_UNTEXTURED = 1;
Graphics3DRenderer.SHADER_UNLIT_TEXTURED = 2;
Graphics3DRenderer.SHADER_LIT_TEXTURED = 3;

Graphics3DRenderer.prototype.init = function ()
{
    var gl = this.gl;

    // SHADER_UNLIT_UNTEXTURED
    {
        this.programs[Graphics3DRenderer.SHADER_UNLIT_UNTEXTURED] = GLutils.createProgram(gl, UnlitUntextured.vert, UnlitUntextured.frag); 

        gl.bindAttribLocation(this.programs[Graphics3DRenderer.SHADER_UNLIT_UNTEXTURED], 0, 'inPosition');
    }

    // SHADER_LIT_UNTEXTURED
    {
        this.programs[Graphics3DRenderer.SHADER_LIT_UNTEXTURED] = GLutils.createProgram(gl, LitUntextured.vert, LitUntextured.frag); 

        gl.bindAttribLocation(this.programs[Graphics3DRenderer.SHADER_LIT_UNTEXTURED], 0, 'inPosition');
        gl.bindAttribLocation(this.programs[Graphics3DRenderer.SHADER_LIT_UNTEXTURED], 1, 'inNormal');
    }

    // SHADER_UNLIT_TEXTURED
    {
        this.programs[Graphics3DRenderer.SHADER_UNLIT_TEXTURED] = GLutils.createProgram(gl, UnlitTextured.vert, UnlitTextured.frag); 

        gl.bindAttribLocation(this.programs[Graphics3DRenderer.SHADER_UNLIT_TEXTURED], 0, 'inPosition');
        gl.bindAttribLocation(this.programs[Graphics3DRenderer.SHADER_UNLIT_TEXTURED], 1, 'inTexCoord');
    }

    // SHADER_LIT_TEXTURED
    {
        this.programs[Graphics3DRenderer.SHADER_LIT_TEXTURED] = GLutils.createProgram(gl, LitTextured.vert, LitTextured.frag); 

        gl.bindAttribLocation(this.programs[Graphics3DRenderer.SHADER_LIT_TEXTURED], 0, 'inPosition');
        gl.bindAttribLocation(this.programs[Graphics3DRenderer.SHADER_LIT_TEXTURED], 1, 'inNormal');
        gl.bindAttribLocation(this.programs[Graphics3DRenderer.SHADER_LIT_TEXTURED], 2, 'inTexCoord');
    }
};

// Call this only once per frame.
Graphics3DRenderer.prototype.updateUniforms = function (uniformData)
{
    var gl = this.gl;
    var camera = uniformData.camera;
    var dirLight = uniformData.dirLight;
    var pointLights = uniformData.pointLights;
    var programs = this.programs;

    for (var index = 0; index < programs.length; ++index)
    {
        var program = programs[index];

        gl.useProgram(program);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uViewMatrix'), false, camera.view);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uProjectionMatrix'), false, camera.projection);
    }

    var litIndices = [Graphics3DRenderer.SHADER_LIT_UNTEXTURED, Graphics3DRenderer.SHADER_LIT_TEXTURED];

    // Update Lit uniforms
    for (var programIndex = 0; programIndex  < litIndices.length; ++programIndex)
    {
        var program = programs[litIndices[programIndex]];

        gl.useProgram(program);
        gl.uniform3fv(gl.getUniformLocation(program, 'uCameraPosition'), camera.position);

        if (dirLight.lastActiveState !== dirLight.active)
        {
            dirLight.lastActiveState = dirLight.active;
            gl.uniform1i(gl.getUniformLocation(program, 'uDirLight.active'), dirLight.active);
        }

        if (dirLight.active)
        {
            gl.uniform3fv(gl.getUniformLocation(program, 'uDirLight.direction'), dirLight.direction);
            gl.uniform3fv(gl.getUniformLocation(program, 'uDirLight.ambient'), dirLight.ambient);
            gl.uniform3fv(gl.getUniformLocation(program, 'uDirLight.diffuse'), dirLight.diffuse);
            gl.uniform3fv(gl.getUniformLocation(program, 'uDirLight.specular'), dirLight.specular);
            gl.uniform1i(gl.getUniformLocation(program, 'uDirLight.active'), dirLight.active);
        }

        for (var index = 0; index < pointLights.length; ++index)
        {
            var light = pointLights[index];
            
            if (light.lastActiveState !== light.active)
            {
                gl.uniform1i(gl.getUniformLocation(program, 'uPointLights[' + index + '].active'), light.active);
            }

            if (light.active)
            {
                gl.uniform3fv(gl.getUniformLocation(program, 'uPointLights[' + index + '].position'), light.position);
                gl.uniform3fv(gl.getUniformLocation(program, 'uPointLights[' + index + '].color'), light.color);
                gl.uniform1f(gl.getUniformLocation(program, 'uPointLights[' + index + '].intensity'), light.intensity);
                gl.uniform1f(gl.getUniformLocation(program, 'uPointLights[' + index + '].range'), light.range);
            }
        }
    }

    for (var index = 0; index < pointLights.length; ++index)
    {
        var light = pointLights[index];
        light.lastActiveState = light.active;
    }

};

Graphics3DRenderer.prototype.draw = function (drawPacket)
{
    var gl = this.gl;
    var model = mat4.identity(this.cachedModel[0]);
    var program = null;
    var mesh = drawPacket.mesh;
    var camera = drawPacket.camera;
    var dirLight = drawPacket.dirLight;
    var pointLights = drawPacket.pointLights;
    var geometry = mesh.geometry;
    
    if (!geometry || geometry.vertexCount === 0) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vbo);

    mat4.fromRotationTranslationScale(model, mesh.quaternion, mesh.position, mesh.scale);

    if (mesh.texture === null)
    {
        if (mesh.material === null)
        {
            program = this.programs[Graphics3DRenderer.SHADER_UNLIT_UNTEXTURED];
            gl.useProgram(program);

            // Vertex Layout
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, Graphics3DRenderer.VERTEX_SIZE, Graphics3DRenderer.VERTEX_POSITION);

            // Per mesh uniform data
            gl.uniform3fv(gl.getUniformLocation(program, 'uFlatColor'), mesh.flatColor);
        }
        else
        {
            var material = mesh.material;
            var invModel = mat4.invert(this.cachedModel[1], model);

            invModel = mat4.transpose(invModel, invModel);
            program = this.programs[Graphics3DRenderer.SHADER_LIT_UNTEXTURED];

            gl.useProgram(program);

            // Vertex Layout
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, Graphics3DRenderer.VERTEX_SIZE, Graphics3DRenderer.VERTEX_POSITION);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, Graphics3DRenderer.VERTEX_SIZE, Graphics3DRenderer.VERTEX_NORMALS);

            // Per mesh uniform data
            gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uInvModelMatrix'), false, invModel);
            gl.uniform1f(gl.getUniformLocation(program, 'uMaterial.shininess'), material.shininess);
            gl.uniform3fv(gl.getUniformLocation(program, 'uMaterial.ambient'), material.ambient);
            gl.uniform3fv(gl.getUniformLocation(program, 'uMaterial.diffuse'), material.diffuse);
            gl.uniform3fv(gl.getUniformLocation(program, 'uMaterial.specular'), material.specular);
            gl.uniform3fv(gl.getUniformLocation(program, 'uMaterial.emission'), material.emission);
        }
    }
    else
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, mesh.texture);

        if (mesh.material === null)
        {
            program = this.programs[Graphics3DRenderer.SHADER_UNLIT_TEXTURED];
            gl.useProgram(program);

            // Vertex Layout
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, Graphics3DRenderer.VERTEX_SIZE, Graphics3DRenderer.VERTEX_POSITION);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, Graphics3DRenderer.VERTEX_SIZE, Graphics3DRenderer.VERTEX_TEXCOORD);

            // Per mesh uniform data
            gl.uniform3fv(gl.getUniformLocation(program, 'uFlatColor'), mesh.flatColor);
        }
        else
        {
            var material = mesh.material;
            var invModel = mat4.invert(this.cachedModel[1], model);

            invModel = mat4.transpose(invModel, invModel);
            program = this.programs[Graphics3DRenderer.SHADER_LIT_TEXTURED];

            gl.useProgram(program);

            // Vertex Layout
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, Graphics3DRenderer.VERTEX_SIZE, Graphics3DRenderer.VERTEX_POSITION);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, Graphics3DRenderer.VERTEX_SIZE, Graphics3DRenderer.VERTEX_NORMALS);
            gl.vertexAttribPointer(2, 2, gl.FLOAT, false, Graphics3DRenderer.VERTEX_SIZE, Graphics3DRenderer.VERTEX_TEXCOORD);

            // Per mesh uniform data
            gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uInvModelMatrix'), false, invModel);
            gl.uniform1f(gl.getUniformLocation(program, 'uMaterial.shininess'), material.shininess);
            gl.uniform3fv(gl.getUniformLocation(program, 'uMaterial.ambient'), material.ambient);
            gl.uniform3fv(gl.getUniformLocation(program, 'uMaterial.diffuse'), material.diffuse);
            gl.uniform3fv(gl.getUniformLocation(program, 'uMaterial.specular'), material.specular);
            gl.uniform3fv(gl.getUniformLocation(program, 'uMaterial.emission'), material.emission);

        }
    }

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uModelMatrix'), false, model);
    gl.drawArrays(gl.TRIANGLES, 0, geometry.vertexCount);
};
