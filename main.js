var canvas, gl;

function onComplete (meshData, texture0, texture1)
{
    var step = 0.0;
    var lastTime = 0.0;
    var frameTimeOutput = document.getElementById('msg');
    var renderer = new Graphics3DRenderer(gl);
    var scene = new Graphics3D(renderer);
    var data0 = scene.makeQuadGeometryBuffer();
    var data1 = scene.makeGeometryBuffer(meshData.vertices, meshData.vertex_count);
    var cube0 = scene.makeStaticMesh(-2, 0, 0, data1, null);
    var cube1 = scene.makeStaticMesh(2, 0, 0, data1, texture0, texture1);
    var light0 = scene.makeStaticMesh(0, 0, 0, data0, null).setScale(0.05, 0.05, 0.05);
    var light1 = scene.makeStaticMesh(0, 0, 0, data0, null).setScale(0.05, 0.05, 0.05);

    scene.camera = new Camera3D();
    scene.camera.setPerspective(Math.PI / 4.0, canvas.width / canvas.height, 0.1, 1000.0);
    scene.camera.lookAt(0, 0, -7, 0, 0, 0);
    scene.camera.setClearColor(0.15, 0.15, 0.25);
    scene.dirLight.active = true;
    scene.dirLight.setDirection(0, .5, -1);
    
    scene.pointLights[0].active = true;
    scene.pointLights[0].setPosition(0, -2, -1);
    scene.pointLights[0].setColor(1, 0, 1);

    scene.pointLights[1].active = true;
    scene.pointLights[1].setPosition(0, -2, -1);
    scene.pointLights[1].setColor(0, 1, 1);

    cube1.material = new Material3D();
    cube1.material.setAmbient(0, 0, 0);
    cube1.material.setShininess(512);
    cube1.material.setSpecular(0.2, 0.2, 0.2);

    cube0.material = cube1.material;

    scene.add(cube0, cube1, light0, light1);

    window.ontouchend = function ()
    {
        if (cube1.normal === null)
        {
            cube1.normal = texture1;
        }
        else
        {
            cube1.normal = null;
        }
    };

    window.onkeyup = function (e)
    {
        if (e.code === 'Space')
        {
            if (cube1.normal === null)
            {
                cube1.normal = texture1;
            }
            else
            {
                cube1.normal = null;
            }
        }
    };

    function renderScene(time)
    {
        lastTime = PrintFrameTime(frameTimeOutput, time, lastTime);

        scene.pointLights[0].setPosition(Math.sin(step) * 4, 0, Math.cos(step) * 4);
        scene.pointLights[1].setPosition(0, Math.sin(step * 2) * 3, Math.cos(step * 2) * 3);
        light0.setPosition(scene.pointLights[0].position[0], scene.pointLights[0].position[1], scene.pointLights[0].position[2]);
        light1.setPosition(scene.pointLights[1].position[0], scene.pointLights[1].position[1], scene.pointLights[1].position[2]);

        cube0.rotateY(0.01);
        cube1.rotateY(0.01);
        
        scene.render();
        requestAnimationFrame(renderScene);
        step += 0.02;
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
    var _texture0, _texture1, _data;

    document.getElementById('msg').innerHTML = "Loading...";

    loadFile('data/meshes/rock.obj', function (data) {
        _data = data;
        if (_texture0 && texture1 && _data)
        {
            onComplete(ParseOBJ(_data), _texture0, _texture1);
        }
    });

    loadImageAsTexture('data/textures/rocks_01_dif.jpg', function (texture0) {
        _texture0 = texture0;
        if (_texture1 && _data)
        {
            onComplete(ParseOBJ(_data), _texture0, _texture1);
        }
    });
    loadImageAsTexture('data/textures/rocks_01_nm.jpg', function (texture1) {
        _texture1 = texture1;
        if (_texture0 && _data)
        {
            onComplete(ParseOBJ(_data), _texture0, _texture1);
        }
    });
};