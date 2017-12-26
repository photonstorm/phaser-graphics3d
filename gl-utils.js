var GLutils = {

    createTexture: function (gl, source)
    {
        var texture = gl.createTexture();

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return texture;
    },

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