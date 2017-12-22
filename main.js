function onComplete (data)
{
    var canvas = document.getElementById('canvas');
    var gl = canvas.getContext('webgl');
    var renderer = new Graphics3DRenderer(gl);
    var scene = new Graphics3D(renderer);
    var scale = 0.7;
    var meshData = scene.makeMeshData(data.vertices, data.vertex_count);
    var cubeMeshData = scene.makeCubeMeshData();
    var quadMeshData = scene.makeQuadMeshData();
    var lightMesh0 = scene.makeStaticMesh(0, 0, -1, cubeMeshData).setScale(0.05, 0.05, 0.05);
    var lightMesh1 = scene.makeStaticMesh(0, 0, -1, cubeMeshData).setScale(0.05, 0.05, 0.05);
    var lightMesh2 = scene.makeStaticMesh(0, 0, -1, cubeMeshData).setScale(0.05, 0.05, 0.05);
    var meshes = [];
    var meshes0 = [];

    scene.camera = new Camera3D();
    scene.camera.setPerspective(Math.PI / 4.0, canvas.width / canvas.height, 0.1, 1000.0);
    scene.camera.lookAt(0, 0, -7, 0, 0, 0);
    scene.dirLight.setDirection(0, 0.5, -1);
    scene.pointLights[0].setColor(0.0, 1.0, 0.0);
    scene.pointLights[1].setColor(1.0, 0.0, 0.0);
    scene.pointLights[2].setColor(0.0, 0.0, 1.0);
    lightMesh0.setFlatColor(0, 1, 0);
    lightMesh1.setFlatColor(1, 0, 0);
    lightMesh2.setFlatColor(0, 0, 1);

    scene.dirLight.active = !true;
    scene.pointLights[0].active = true;
    scene.pointLights[1].active = true;
    scene.pointLights[2].active = true;

    {
        let mesh = scene.makeStaticMesh(0, 0, 0, meshData);
        mesh.rotateY(180 * Math.PI / 180);
        mesh.setScale(scale, scale, scale);
        mesh.material = new Material3D();
        scene.add(mesh, lightMesh0, lightMesh1, lightMesh2);
        meshes.push(mesh);
    }

    {
        let mesh0 = scene.makeStaticMesh(-3, 0, 0, cubeMeshData).setScale(0.5, 0.5, 0.5);
        let mesh1 = scene.makeStaticMesh(3, 0, 0, cubeMeshData).setScale(0.5, 0.5, 0.5);
        let mesh2 = scene.makeStaticMesh(0, -1.5, 0, cubeMeshData).rotateX(-90 * Math.PI / 180).setScale(4, 4, 0.4);
        let material = new Material3D();
        
        mesh0.material = material;
        mesh1.material = material;
        mesh2.material = material;


        scene.add(mesh0, mesh1, mesh2);
        meshes0.push(mesh0, mesh1);
    }

    var on = false;

    window.onclick = window.ontouchend = function (evt) {
        if (scene.dirLight.active)
        {   
            scene.dirLight.active = false;
        }
        else
        {
            scene.dirLight.active = true;
        }
    }

    var t = 1.0;

    function renderScene(time)
    {
        for (var i = 0; i < meshes.length; ++i)
        {
            meshes[i].rotateY(-0.01);
        }
        for (var i = 0; i < meshes0.length; ++i)
        {
            meshes0[i].rotateX(-0.01);
        }
        scene.pointLights[0].setPosition(Math.sin(t) * 2, 1, Math.cos(t) * 2);
        scene.pointLights[1].setPosition(Math.sin(-t) * 2, 1, Math.cos(t) * 2);
        scene.pointLights[2].setPosition(0, 1+ Math.sin(t) * 2, Math.cos(-t) * 2);
        lightMesh0.setPosition(
            scene.pointLights[0].position[0],
            scene.pointLights[0].position[1],
            scene.pointLights[0].position[2]
        );
        lightMesh1.setPosition(
            scene.pointLights[1].position[0],
            scene.pointLights[1].position[1],
            scene.pointLights[1].position[2]
        );
        lightMesh2.setPosition(
            scene.pointLights[2].position[0],
            scene.pointLights[2].position[1],
            scene.pointLights[2].position[2]
        );
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