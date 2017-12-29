var objpar = function (str)
{
	let lines = str.split('\n');
	let line_count = lines.length;
	let vertices = [];
	let normals = [];
	let texcoords = [];
	let faces = [];

	for (let index = 0; index < line_count; ++index)
	{
		let line = lines[index];
		let c0 = line.charAt(0);
		let c1 = line.charAt(1);

		if (c0 === '#')
		{
			continue;
		}
		else if (c0 === 'v' && c1 === ' ')
		{
			let components = line.split(' ');
			for (let i = 1; i < components.length; ++i)
			{
				vertices.push(parseFloat(components[i]));
			}
		}
		else if (c0 === 'v' && c1 === 't')
		{
			let components = line.split(' ');
			for (let i = 1; i < components.length; ++i)
			{
				texcoords.push(parseFloat(components[i]));
			}			
		}
		else if (c0 === 'v' && c1 === 'n')
		{
			let components = line.split(' ');
			for (let i = 1; i < components.length; ++i)
			{
				normals.push(parseFloat(components[i]));
			}			
		}
		else if (c0 === 'f')
		{
			let components = line.split(' ');
			for (let i = 1; i < components.length; ++i)
			{
				let sub_components = components[i].split('/');
				let indices = [0, 0, 0];
				for (let j = 0; j < indices.length; ++j)
				{
					let num = parseInt(sub_components[j]);
					if (!isNaN(num))
					{
						indices[j] = num;
					}
				}
				faces.push(indices);
			}	
		}
	}

	return {
		vertices: vertices,
		normals: normals,
		texcoords: texcoords,
		faces: faces
	};
};

/*
	this is the order of the vertex output:

	struct Vertex {
		vec3 position;
		vec3 normal;   // If it's provided
		vec2 texcoord; // If it's provided
	};
*/
var objpar_to_mesh = function (obj) 
{
	let vertices = [];
	let indices = [];
	let offset_size = (obj.vertices.length > 0 ? 3 : 0) + (obj.normals.length > 0 ? 3 : 0) + (obj.texcoords.length > 0 ? 3 : 0);
	let stride = offset_size * Float32Array.BYTES_PER_ELEMENT;
	let texcoord = obj.texcoords.length > 0;

	for (let index = 0; index < obj.faces.length; index += 1)
	{
		let face = obj.faces[index];

		if (obj.vertices.length > 0)
		{
			let idx = (face[0] - 1) * 3;
			let x = obj.vertices[idx + 0];
			let y = obj.vertices[idx + 1];
			let z = obj.vertices[idx + 2];
			if (x === undefined || y === undefined || z === undefined)
				debugger;
			vertices.push(x, y, z);
		}
		if (obj.normals.length > 0)
		{
			let idx = (face[2] - 1) * 3;
			let x = obj.normals[idx + 0];
			let y = obj.normals[idx + 1];
			let z = obj.normals[idx + 2];
			if (x === undefined || y === undefined || z === undefined)
				debugger;
			vertices.push(x, y, z);
		}
		if (obj.texcoords.length > 0)
		{
			let idx = (face[1] - 1) * 2;
			let x = obj.texcoords[idx + 0];
			let y = obj.texcoords[idx + 1];
			if (x === undefined || y === undefined)
				debugger;
			vertices.push(x, y);

			// tangents
			vertices.push(0, 0, 0);
		}
	}

	if (texcoord)
	{
		for (let index = 0; index < vertices.length; index += 33 /* 11 floats * 3 */)
		{
			let vp0x = vertices[index + 0];
			let vp0y = vertices[index + 1];
			let vp0z = vertices[index + 2];
			let vn0x = vertices[index + 3];
			let vn0y = vertices[index + 4];
			let vn0z = vertices[index + 5];
			let tc0u = vertices[index + 6];
			let tc0v = vertices[index + 7];
			let ta0x = vertices[index + 8];
			let ta0y = vertices[index + 9];
			let ta0z = vertices[index + 10];

			let vp1x = vertices[index + 11];
			let vp1y = vertices[index + 12];
			let vp1z = vertices[index + 13];
			let vn1x = vertices[index + 14];
			let vn1y = vertices[index + 15];
			let vn1z = vertices[index + 16];
			let tc1u = vertices[index + 17];
			let tc1v = vertices[index + 18];
			let ta1x = vertices[index + 19];
			let ta1y = vertices[index + 20];
			let ta1z = vertices[index + 21];

			let vp2x = vertices[index + 22];
			let vp2y = vertices[index + 23];
			let vp2z = vertices[index + 24];
			let vn2x = vertices[index + 25];
			let vn2y = vertices[index + 26];
			let vn2z = vertices[index + 27];
			let tc2u = vertices[index + 28];
			let tc2v = vertices[index + 29];
			let ta2x = vertices[index + 30];
			let ta2y = vertices[index + 31];
			let ta2z = vertices[index + 32];

			let deltap0x = vp1x - vp0x;
			let deltap0y = vp1y - vp0y;
			let deltap0z = vp1z - vp0z;

			let deltap1x = vp2x - vp0x;
			let deltap1y = vp2y - vp0y;
			let deltap1z = vp2z - vp0z;

			let deltatc0u = tc1u - tc0u;
			let deltatc0v = tc1v - tc0v;

			let deltatc1u = tc2u - tc0u;
			let deltatc1v = tc2v - tc0v;

			let f = 1.0 / (deltatc0u * deltatc1v - deltatc1u * deltatc0v);

			let tanX, btanX;
			let tanY, btanY;
			let tanZ, btanZ;

		}
	}

	return {
		vertices: new Float32Array(vertices),
		vertex_count: obj.faces.length,
		texcoord: texcoord
	};
};
