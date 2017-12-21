var GLutils = {

    createProgram: function (gl, vShaderSource, fShaderSource)
    {
        var program = gl.createProgram();
        var vshader = gl.createShader(gl.VERTEX_SHADER);
        var fshader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vshader, vShaderSource);
        gl.shaderSource(fshader, fShaderSource);

        gl.compileShader(vshader);
        gl.compileShader(fshader);

        if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS))
        {
            console.error('Vertex Shader Error\n', gl.getShaderInfoLog(vshader), '\n\n', vShaderSource);
            return null;
        }

        if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS))
        {
            console.error('Fragment Shader Error\n', gl.getShaderInfoLog(fshader), '\n\n', vShaderSource);
            return null;
        }

        gl.attachShader(program, vshader);
        gl.attachShader(program, fshader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            console.error('Program Linking Error\n', gl.getProgramInfoLog(program));
            return null;
        }        
    
        return program;
    }

};