function PointLight3D(x, y, z)
{
    this.position = vec3.fromValues(x, y, z);
    this.color = vec3.fromValues(1.0, 1.0, 1.0);
    this.range = 5.0;
    this.intensity = 0.5;
    this.active = false;
    this.lastActiveState = false;
}

PointLight3D.prototype.setPosition = function (x, y, z)
{
    this.position[0] = x;
    this.position[1] = y;
    this.position[2] = z;
    return this;
};

PointLight3D.prototype.setColor = function (r, g, b)
{
    this.color[0] = r;
    this.color[1] = g;
    this.color[2] = b;
    return this;
};

PointLight3D.prototype.setIntensity = function (intensity)
{
    this.intensity = intensity;
    return this;
};

PointLight3D.prototype.setRange = function (range)
{
    this.range = range;
    return this;
};
