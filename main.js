function onComplete (data)
{
    var canvas = document.getElementById('canvas');
    var gl = canvas.getContext('webgl');
    var renderer = new Graphics3DRenderer(gl);
    var scene = new Graphics3D(renderer);
    var meshData = scene.makeMeshData(data.vertices, data.vertex_count);
    var cubeMeshData = scene.makeCubeMeshData();
    var meshes = [];

    scene.camera = new Camera3D();
    scene.camera.setPerspective(Math.PI / 4.0, canvas.width / canvas.height, 0.1, 1000.0);
    scene.camera.lookAt(0, 0, -7, 0, 0, 0);
    scene.dirLight.setDirection(0, .5, -1);
    //scene.dirLight.active = true;

    scene.pointLights[0].active = true;
    scene.pointLights[0].range = 2;
    scene.pointLights[0].intensity = 2;
    scene.pointLights[0].setPosition(0, 2, 0);
    scene.pointLights[0].setColor(1, 0, 0);

    for (var x = -4; x <= 4; ++x)
    {
        for(var z = 0; z < 50; ++z)
        {
            var mesh = scene.makeStaticMesh(x, -2.5, z, meshData).setScale(0.25, 0.25, 0.25);
            var scale = 0.2 + Math.random() * 0.25;
            mesh.material = new Material3D();
            mesh.material.setDiffuse(Math.random(), Math.random(), Math.random());
            mesh.material.setSpecular(Math.random(), Math.random(), Math.random());
            mesh.material.setShininess(Math.random() * 512);
            mesh.setScale(scale, scale, scale);
            scene.add(mesh);
            meshes.push(mesh); 
        }
    }

    var t = 1.0;
    var lastTime = 0.0;
    var frameTimeOutput = document.getElementById('msg');
    function renderScene(time)
    {
        var delta = time - lastTime;
        frameTimeOutput.innerHTML = delta.toFixed(2) + ' ms';
        lastTime = time;

        for (var index = 0; index < meshes.length; ++index)
        {
            meshes[index].rotateY(0.01);
            meshes[index].position[1] = -2.5 + Math.sin(t + index) * 0.2;
        }

        scene.pointLights[0].setPosition(0, 2, Math.sin(t) * 10);
        scene.render();

        t += 0.02;

        requestAnimationFrame(renderScene);
    }

    renderScene(0);
};

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

window.onload = function ()
{
    loadFile('data/teapot.obj', function (data) {
        onComplete(ParseOBJ(data));
    });
};