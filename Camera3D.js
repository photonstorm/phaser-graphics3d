function Camera3D()
{
    this.projection = mat4.create();
    this.view = mat4.create();
    this.position = vec3.create();
    this.clearColor = vec3.create();
}

Camera3D.prototype.setClearColor = function (r, g, b)
{
    this.clearColor[0] = r;
    this.clearColor[1] = g;
    this.clearColor[2] = b;

    return this;
};

Camera3D.prototype.setPosition = function (x, y, z)
{
    this.position[0] = x;
    this.position[1] = y;
    this.position[2] = z;

    return this;
};

Camera3D.prototype.setOrtho = function (left, right, bottom, top, near, far)
{
    mat4.identity(this.projection);
    mat4.ortho(this.projection, left, right, bottom, top, near, far);

    return this;
};

Camera3D.prototype.setPerspective = function (fieldOfView, aspectRatio, near, far)
{
    mat4.identity(this.projection);
    mat4.perspective(this.projection, fieldOfView, aspectRatio, near, far);

    return this;
};

Camera3D.prototype.lookAt = function (px, py, pz, x, y, z)
{   
    this.setPosition(px, py, pz);
    mat4.identity(this.view);
    mat4.lookAt(this.view, this.position, [x, y, z], [0, 1, 0]);

    return this;
};