function Material3D()
{
    this.ambient = vec3.fromValues(0.2, 0.2, 0.2);
    this.diffuse = vec3.fromValues(0.8, 0.8, 0.8);
    this.specular = vec3.fromValues(0.0, 0.0, 0.0);
    this.emission = vec3.fromValues(0.0, 0.0, 0.0);
    this.shininess = 0.0;
}

Material3D.prototype.setAmbient = function (r, g, b)
{
    this.ambient[0] = r;
    this.ambient[1] = g;
    this.ambient[2] = b;

    return this;
};

Material3D.prototype.setDiffuse = function (r, g, b)
{
    this.diffuse[0] = r;
    this.diffuse[1] = g;
    this.diffuse[2] = b;

    return this;
};

Material3D.prototype.setSpecular = function (r, g, b)
{
    this.specular[0] = r;
    this.specular[1] = g;
    this.specular[2] = b;

    return this;
};

Material3D.prototype.setEmission = function (r, g, b)
{
    this.emission[0] = r;
    this.emission[1] = g;
    this.emission[2] = b;

    return this;
};

Material3D.prototype.setShininess = function (shininess)
{
    this.shininess = shininess;

    return this;
};