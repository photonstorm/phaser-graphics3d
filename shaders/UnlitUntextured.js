var UnlitUntextured =
{
	vert: `
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

    frag: `
    precision highp float;

    #define SHADER_NAME SHADER_UNLIT_UNTEXTURED_FRAG

    uniform vec3 uFlatColor;
    
    void main()
    {
        gl_FragColor = vec4(uFlatColor, 1.0);
    }
	`
};
