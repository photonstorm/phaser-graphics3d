
function MeshData3D()
{
    this.vbo = null;
    this.vertices = null;
    this.texture = null;
    this.vertexCount = 0;
}

function StaticMesh3D(x, y, z, meshData)
{

    this.position = vec3.fromValues(x, y, z);
    this.scale = vec3.fromValues(1.0, 1.0, 1.0);
    this.quaternion = quat.create();
    this.meshData = meshData ? meshData : new MeshData3D();
    this.material = null;
    this.flatColor = vec3.fromValues(1.0, 1.0, 1.0);

}

StaticMesh3D.prototype.setFlatColor = function (r, g, b)
{
    this.flatColor = vec3.fromValues(r, g, b);
    return this;
};

StaticMesh3D.prototype.setPosition = function (x, y, z)
{
    this.position[0] = x;
    this.position[1] = y;
    this.position[2] = z;
    return this;
};

StaticMesh3D.prototype.setScale = function (x, y, z)
{
    this.scale[0] = x;
    this.scale[1] = y;
    this.scale[2] = z;
    return this;
};

StaticMesh3D.prototype.setEulerRotation = function (x, y, z)
{
    quat.fromEuler(this.quaternion, x, y, z);
    return this;
};

StaticMesh3D.prototype.rotateX = function (radian)
{
    quat.rotateX(this.quaternion, this.quaternion, radian);
    return this;
};

StaticMesh3D.prototype.rotateY = function (radian)
{
    quat.rotateY(this.quaternion, this.quaternion, radian);
    return this;
};

StaticMesh3D.prototype.rotateZ = function (radian)
{
    quat.rotateZ(this.quaternion, this.quaternion, radian);
    return this;
};