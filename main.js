var canvas, gl;

function onComplete (meshData, texture0, texture1)
{
    var lastTime = 0.0;
    var frameTimeOutput = document.getElementById('msg');
    var renderer = new Graphics3DRenderer(gl);
    var scene = new Graphics3D(renderer);
    var data0 = scene.makeQuadGeometryBuffer();
    var data1 = scene.makeGeometryBuffer(meshData.vertices, meshData.vertex_count);
    var cube0 = scene.makeStaticMesh(-2, 0, 0, data1, null);
    var cube1 = scene.makeStaticMesh(2, 0, 0, data1, texture0);

    scene.camera = new Camera3D();
    scene.camera.setPerspective(Math.PI / 4.0, canvas.width / canvas.height, 0.1, 1000.0);
    scene.camera.lookAt(0, 0, -7, 0, 0, 0);
    scene.camera.setClearColor(0.15, 0.15, 0.25);
    scene.dirLight.active = true;
    scene.dirLight.setDirection(0, .5, -1);
    
    scene.pointLights[0].active = true;
    scene.pointLights[0].range = 20;
    scene.pointLights[0].intensity = 2;
    scene.pointLights[0].setPosition(0, -2, -1);
    scene.pointLights[0].setColor(0, 1, 1);

    cube1.material = new Material3D();
    cube1.material.setAmbient(0, 0, 0);

    cube0.material = cube1.material;

    scene.add(cube0, cube1);

    function renderScene(time)
    {
        lastTime = PrintFrameTime(frameTimeOutput, time, lastTime);

        cube0.rotateY(0.01);
        cube0.rotateX(-0.01);
        cube0.rotateZ(0.02);
        cube1.rotateY(0.01);
        cube1.rotateX(-0.01);
        cube1.rotateZ(0.02);
        
        scene.render();
        requestAnimationFrame(renderScene);
    }

    renderScene(0);
};

function PrintFrameTime(output, time, lastTime)
{
    var delta = time - lastTime;
    output.innerHTML = delta.toFixed(2) + ' ms';
    lastTime = time;
    return lastTime;
}

function loadFile(name, callback)
{
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200)
        {
            callback(xhr.responseText);
        }
    };
    xhr.open('GET', name, true);
    xhr.send(null);
}

function loadImageAsTexture(name, callback)
{
    var image = new Image();
    image.onload = function (evt)
    {
        callback(GLutils.createTexture(gl, evt.target));
    };
    image.src = name;
}

window.onload = function ()
{
    canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl');

    loadFile('data/meshes/cube.obj', function (data) {
        loadImageAsTexture('data/textures/brick.jpg', function (texture0) {
            loadImageAsTexture('data/textures/sao-sinon.png', function (texture1) {
                onComplete(ParseOBJ(data), texture0, texture1);
            });
        });
    });
};