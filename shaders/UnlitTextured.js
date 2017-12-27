var UnlitTextured = 
{

	vert: `
    #define SHADER_NAME SHADER_UNLIT_TEXTURED_VERT

    precision highp float;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    attribute vec3 inPosition;
    attribute vec2 inTexCoord;

    varying vec2 outTexCoord;

    void main()
    {

        mat4 mvp = uProjectionMatrix * uViewMatrix * uModelMatrix;
        gl_Position = mvp * vec4(inPosition, 1.0);
        outTexCoord = inTexCoord;
    }
    `,

    frag: `
    precision highp float;

    #define SHADER_NAME SHADER_UNLIT_TEXTURED_FRAG

    uniform vec3 uFlatColor;
    uniform sampler2D uMainSampler;

    varying vec2 outTexCoord;
    
    void main()
    {
        gl_FragColor = texture2D(uMainSampler, outTexCoord) * vec4(uFlatColor, 1.0);
    }
    `
};