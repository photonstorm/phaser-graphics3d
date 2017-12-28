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
	let attributes = {};
	let offset = 0;

	if (obj.vertices.length > 0)
	{
		attributes.position = 
		{
			size: 3,
			stride: stride,
			offset: offset
		};
		offset += 3 * Float32Array.BYTES_PER_ELEMENT;
	}
	if (obj.texcoords.length > 0)
	{
		attributes.texcoord = 
		{
			size: 3,
			stride: stride,
			offset: offset
		};
		offset += 3 * Float32Array.BYTES_PER_ELEMENT;
	}
	if (obj.normals.length > 0)
	{
		attributes.normal = 
		{
			size: 3,
			stride: stride,
			offset: offset
		};
		offset += 3 * Float32Array.BYTES_PER_ELEMENT;
	}

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
			//let z = obj.texcoords[idx + 2];
			if (x === undefined || y === undefined)// || z === undefined)
				debugger;
			vertices.push(x, y);
		}
	}

	return {
		vertices: new Float32Array(vertices),
		vertex_count: obj.faces.length,
		attributes: attributes
	};
};
