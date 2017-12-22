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

Graphics3DRenderer.prototype.init = function ()
{
    var gl = this.gl;

    // SHADER_UNLIT_UNTEXTURED
    {
        this.programs[0] = GLutils.createProgram(gl,
            `
            #define SHADER_NAME SHADER_UNLIT_UNTEXTURED_VERT

            precision highp float;

            uniform mat4 uModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;

            attribute vec3 inPosition;

            void main()
            {

                mat4 mvp = uProjectionMatrix * uViewMatrix * uModelMatrix;
                gl_Position = mvp * vec4(inPosition, 1.0);

            }
            `,
            `
            precision highp float;

            #define SHADER_NAME SHADER_UNLIT_UNTEXTURED_FRAG

            uniform vec3 uFlatColor;
            
            void main()
            {
                gl_FragColor = vec4(uFlatColor, 1.0);
            }

            `
        ); 

        gl.bindAttribLocation(this.programs[0], 0, 'inPosition');
        gl.bindAttribLocation(this.programs[0], 1, 'inNormal');
    }

    // SHADER_LIT_UNTEXTURED
    {
        this.programs[1] = GLutils.createProgram(gl,
            `
            #define SHADER_NAME SHADER_LIT_UNTEXTURED_VERT
            
            precision lowp float;

            uniform mat4 uModelMatrix;
            uniform mat4 uInvModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;

            attribute vec3 inPosition;
            attribute vec3 inNormal;

            varying vec3 outEyePosition;
            varying vec3 outNormal;

            void main()
            {

                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(inPosition, 1.0);

                outEyePosition = vec3(uModelMatrix * vec4(inPosition, 1.0));
                outNormal = vec3(uInvModelMatrix * vec4(inNormal, 0.0));
            }
            `,
            `
            #define SHADER_NAME SHADER_LIT_UNTEXTURED_FRAG

            precision lowp float;

            struct Material
            {
                vec3 ambient;
                vec3 diffuse;
                vec3 specular;
                vec3 emission;
                float shininess;
            };

            struct DirLight
            {
                vec3 direction;
                vec3 ambient;
                vec3 diffuse;
                vec3 specular;
                bool active;
            };

            struct PointLight
            {
                vec3 position;
                vec3 color;
                float intensity;
                float range;
                bool active;
            };

            #define POINT_LIGHT_COUNT 16

            uniform Material uMaterial;
            uniform DirLight uDirLight;
            uniform PointLight uPointLights[POINT_LIGHT_COUNT];
            uniform vec3 uCameraPos;

            varying vec3 outEyePosition;
            varying vec3 outNormal;

            float SafePow(float x, float y)
            {
                return (y > 0.0) ? pow(x, y) : 0.0;
            }

            vec3 GetDirLight(DirLight light, Material material, vec3 normal, vec3 eyeView)
            {
                vec3 finalColor = vec3(0);
                float normDotLight = max(dot(normalize(normal), normalize(light.direction)), 0.0);
                vec3 diffuse = normDotLight * (material.diffuse + light.diffuse / 2.0);
                vec3 halfVector = normalize(eyeView + normalize(light.direction));
                float normDotHalfVec = max(dot(normalize(normal), halfVector), 0.0);
                vec3 specular = SafePow(normDotHalfVec, material.shininess) * (material.specular + light.specular / 2.0);
                vec3 ambient = (material.ambient + light.ambient / 2.0);

                finalColor = diffuse + specular + ambient + material.emission;

                return finalColor;

            }

            vec3 GetPointLight(PointLight light, Material material, vec3 normal, vec3 eyeView)
            {
                vec3 finalColor = vec3(0.0);
                vec3 lightDir = light.position - eyeView;
                float normDotLight = max(dot(normalize(normal), normalize(lightDir)), 0.0);
                float lightDistance = length(lightDir);
                float denom = max(lightDistance - light.range, 0.0) / light.range + 1.0;
                float attenuation = max(light.intensity / (denom * denom), 0.0);
                vec3 diffuse = (normDotLight * (material.diffuse + light.color / 2.0));
                vec3 halfVector = normalize(eyeView + lightDir);
                float normDotHalfVec = max(dot(normalize(normal), halfVector), 0.0);
                vec3 specular = (material.specular + light.color / 2.0) * SafePow(normDotHalfVec, material.shininess);
                finalColor = attenuation * (diffuse + specular);

                return finalColor;
            }

            void main()
            {
                vec3 finalColor = vec3(0.0);

                if (uDirLight.active)
                {
                    finalColor += GetDirLight(uDirLight, uMaterial, outNormal, uCameraPos);
                }

                for (int index = 0; index < POINT_LIGHT_COUNT; ++index)
                {   
                    if (uPointLights[index].active)
                    {
                        finalColor += GetPointLight(uPointLights[index], uMaterial, outNormal, outEyePosition);
                    }
                }

                gl_FragColor = vec4(finalColor, 1.0);

            }

            `
        ); 

        gl.bindAttribLocation(this.programs[1], 0, 'inPosition');
        gl.bindAttribLocation(this.programs[1], 1, 'inNormal');
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

    // Update SHADER_LIT_UNTEXTURED uniforms
    {
        var program = programs[Graphics3DRenderer.SHADER_LIT_UNTEXTURED];

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
                light.lastActiveState = light.active;
                gl.uniform1i(gl.getUniformLocation(program, 'uPointLights[' + index + '].active'), light.active);
            }

            if (light.active)
            {
                gl.uniform3fv(gl.getUniformLocation(program, 'uPointLights[' + index + '].position'), light.position);
                gl.uniform3fv(gl.getUniformLocation(program, 'uPointLights[' + index + '].color'), light.color);
                gl.uniform1f(gl.getUniformLocation(program, 'uPointLights[' + index + '].intensity'), light.intensity);
                gl.uniform1f(gl.getUniformLocation(program, 'uPointLights[' + index + '].range'), light.range);
                //gl.uniform1f(gl.getUniformLocation(program, 'uPointLights[' + index + '].constantTerm'), light.constantTerm);
                //gl.uniform1f(gl.getUniformLocation(program, 'uPointLights[' + index + '].linearTerm'), light.linearTerm);
                //gl.uniform1f(gl.getUniformLocation(program, 'uPointLights[' + index + '].quadraticTerm'), light.quadraticTerm);
            }
        }
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
    var meshData = mesh.meshData;
    
    if (!meshData || meshData.vertexCount === 0) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, meshData.vbo);

    mat4.fromRotationTranslationScale(model, mesh.quaternion, mesh.position, mesh.scale);

    if (meshData.texture === null)
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
            program = this.programs[1];

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
    
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uModelMatrix'), false, model);
    gl.drawArrays(gl.TRIANGLES, 0, meshData.vertexCount);
};
