function DirLight3D(x, y, z)
{
    this.direction = vec3.fromValues(x, y, z);
    this.ambient = vec3.fromValues(0.0, 0.0, 0.0);
    this.diffuse = vec3.fromValues(0.1, 0.1, 0.1);
    this.specular = vec3.fromValues(0.0, 0.0, 0.0);
    this.active = false;
}

DirLight3D.prototype.setDirection = function (x, y, z)
{
    this.direction[0] = x;
    this.direction[1] = y;
    this.direction[2] = z;

    return this;
};

DirLight3D.prototype.setAmbient = function (r, g, b)
{
    this.ambient[0] = r;
    this.ambient[1] = g;
    this.ambient[2] = b;

    return this;
};

DirLight3D.prototype.setDiffuse = function (r, g, b)
{
    this.diffuse[0] = r;
    this.diffuse[1] = g;
    this.diffuse[2] = b;

    return this;
};

DirLight3D.prototype.setSpecular = function (r, g, b)
{
    this.specular[0] = r;
    this.specular[1] = g;
    this.specular[2] = b;

    return this;
};