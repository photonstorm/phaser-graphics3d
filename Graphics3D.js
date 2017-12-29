function Graphics3D(renderer)
{
    this.renderer = renderer;
    this.displayList = [];
    this.camera = null;
    this.dirLight = new DirLight3D(0, 0, 0);
    this.pointLights = [];

    for (var index = 0; index < Graphics3D.MAX_LIGHTS; ++index)
    {
        this.pointLights[index] = new PointLight3D(0, 0, 0);
    }
}

Graphics3D.MAX_LIGHTS = 16;

Graphics3D.prototype.cloneStaticMesh = function (x, y, z, staticMesh)
{
    var mesh = new StaticMesh3D(x, y, z, staticMesh.geometry);

    return mesh;
};

Graphics3D.prototype.makeGeometryBuffer = function (vertices, vertexCount)
{
    // Vertex Definition
    //
    // struct Vertex {
    //     vec3 position;
    //     vec3 normals;
    //     vec2 texcoord;
    // };
    //

    var gl = this.renderer.gl;
    var geometry = new GeometryBuffer3D();

    geometry.vbo = gl.createBuffer();
    geometry.vertices = vertices;
    geometry.vertexCount = vertexCount;

    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return geometry;
};

Graphics3D.prototype.makeStaticMesh = function (x, y, z, geometry, texture)
{
    var gl = this.renderer.gl;
    var mesh = new StaticMesh3D(x, y, z, geometry, texture);

    return mesh;
};

Graphics3D.prototype.makeQuadGeometryBuffer = function ()
{
    return this.makeGeometryBuffer(new Float32Array([
            -1.0, +1.0, +0.0,  0.0, 0.0, 1.0,  0.0, 0.0,
            -1.0, -1.0, +0.0,  0.0, 0.0, 1.0,  0.0, 1.0,
            +1.0, -1.0, +0.0,  0.0, 0.0, 1.0,  1.0, 1.0,
            -1.0, +1.0, +0.0,  0.0, 0.0, 1.0,  0.0, 0.0,
            +1.0, -1.0, +0.0,  0.0, 0.0, 1.0,  1.0, 1.0,
            +1.0, +1.0, +0.0,  0.0, 0.0, 1.0,  1.0, 0.0
        ]),
        6);
};

Graphics3D.prototype.makeCubeGeometryBuffer = function ()
{
    return this.makeGeometryBuffer(new Float32Array([
            -1, +1, +1, -1, +0, +0, +0, +0, 
            -1, -1, -1, -1, +0, +0, +0, +0, 
            -1, -1, +1, -1, +0, +0, +0, +0, 
            -1, +1, -1, +0, +0, -1, +0, +0, 
            +1, -1, -1, +0, +0, -1, +0, +0, 
            -1, -1, -1, +0, +0, -1, +0, +0, 
            +1, +1, -1, +1, +0, +0, +0, +0, 
            +1, -1, +1, +1, +0, +0, +0, +0, 
            +1, -1, -1, +1, +0, +0, +0, +0, 
            +1, +1, +1, +0, +0, +1, +0, +0, 
            -1, -1, +1, +0, +0, +1, +0, +0, 
            +1, -1, +1, +0, +0, +1, +0, +0, 
            +1, -1, -1, +0, -1, +0, +0, +0, 
            -1, -1, +1, +0, -1, +0, +0, +0, 
            -1, -1, -1, +0, -1, +0, +0, +0, 
            -1, +1, -1, +0, +1, +0, +0, +0, 
            +1, +1, +1, +0, +1, +0, +0, +0, 
            +1, +1, -1, +0, +1, +0, +0, +0, 
            -1, +1, +1, -1, +0, +0, +0, +0, 
            -1, +1, -1, -1, +0, +0, +0, +0, 
            -1, -1, -1, -1, +0, +0, +0, +0, 
            -1, +1, -1, +0, +0, -1, +0, +0, 
            +1, +1, -1, +0, +0, -1, +0, +0, 
            +1, -1, -1, +0, +0, -1, +0, +0, 
            +1, +1, -1, +1, +0, +0, +0, +0, 
            +1, +1, +1, +1, +0, +0, +0, +0, 
            +1, -1, +1, +1, +0, +0, +0, +0, 
            +1, +1, +1, +0, +0, +1, +0, +0, 
            -1, +1, +1, +0, +0, +1, +0, +0, 
            -1, -1, +1, +0, +0, +1, +0, +0, 
            +1, -1, -1, +0, -1, +0, +0, +0, 
            +1, -1, +1, +0, -1, +0, +0, +0, 
            -1, -1, +1, +0, -1, +0, +0, +0, 
            -1, +1, -1, +0, +1, +0, +0, +0, 
            -1, +1, +1, +0, +1, +0, +0, +0, 
            +1, +1, +1, +0, +1, +0, +0, +0
        ]),
        36);
};

Graphics3D.prototype.add = function ()
{
    var args = Array.prototype.slice.call(arguments);
    var displayList = this.displayList;

    for (var index = 0; index < args.length; ++index)
    {
        var mesh = args[index];
        if (displayList.indexOf(mesh) < 0)
        {
            displayList.push(mesh);
        }
    }
};

Graphics3D.prototype.render = function ()
{
    var camera = this.camera;

    if (camera)
    {
        var renderer = this.renderer;
        var displayList = this.displayList;
        var dirLight = this.dirLight;
        var pointLights = this.pointLights;
        var displayListLength = displayList.length;
        var gl = renderer.gl;

        gl.clearColor(camera.clearColor[0], camera.clearColor[1], camera.clearColor[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);

        renderer.updateUniforms({
            dirLight: dirLight,
            pointLights: pointLights,
            camera: camera
        });

        for (var meshIndex = 0; meshIndex < displayListLength; ++meshIndex)
        {
            renderer.draw({
                mesh: displayList[meshIndex]
            });
        }

        gl.disable(gl.DEPTH_TEST);
    }
};