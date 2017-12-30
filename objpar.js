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
	let tangents = [];
	let bitangents = [];

	if (texcoord)
	{
		// Generate Tangent Data
		for (let index = 0; index < obj.faces.length; index += 3)
		{
			let face0 = obj.faces[index + 0];
			let face1 = obj.faces[index + 1];
			let face2 = obj.faces[index + 2];
			let idx;
			let v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z;
			let t0x, t0y, t1x, t1y, t2x, t2y;
			let dtv0x, dtv0y, dtv0z;
			let dtv1x, dtv1y, dtv1z;
			let dtt0x, dtt0y;
			let dtt1x, dtt1y;
			let tanx, tany, tanz;
			let btanx, btany, btanz;
			let f;
			let vidx0, vidx1, vidx2;

			vidx0 = idx = (face0[0] - 1) * 3;
			v0x = obj.vertices[idx + 0];
			v0y = obj.vertices[idx + 1];
			v0z = obj.vertices[idx + 2];

			vidx1 = idx = (face1[0] - 1) * 3;
			v1x = obj.vertices[idx + 0];
			v1y = obj.vertices[idx + 1];
			v1z = obj.vertices[idx + 2];

			vidx2 = idx = (face2[0] - 1) * 3;
			v2x = obj.vertices[idx + 0];
			v2y = obj.vertices[idx + 1];
			v2z = obj.vertices[idx + 2];

			idx = (face0[1] - 1) * 2;
			t0x = obj.texcoords[idx + 0];
			t0y = obj.texcoords[idx + 1];

			idx = (face1[1] - 1) * 2;
			t1x = obj.texcoords[idx + 0];
			t1y = obj.texcoords[idx + 1];

			idx = (face2[1] - 1) * 2;
			t2x = obj.texcoords[idx + 0];
			t2y = obj.texcoords[idx + 1];

			dtv0x = v1x - v0x;
			dtv0y = v1y - v0y;
			dtv0z = v1z - v0z;

			dtv1x = v2x - v0x;
			dtv1y = v2y - v0y;
			dtv1z = v2z - v0z;

			dtt0x = t1x - t0x;
			dtt0y = t1y - t0y;
			dtt1x = t2x - t0x;
			dtt1y = t2y - t0y;

			f = 1.0 / (dtt0x * dtt1y - dtt1x * dtt0y);

			tanx = f * (dtt1y * dtv0x - dtt0y * dtv1x);
			tany = f * (dtt1y * dtv0y - dtt0y * dtv1y);
			tanz = f * (dtt1y * dtv0z - dtt0y * dtv1z);

			btanx = f * (-dtt1x * dtv0x - dtt0x * dtv1x);
			btany = f * (-dtt1x * dtv0y - dtt0x * dtv1y);
			btanz = f * (-dtt1x * dtv0z - dtt0x * dtv1z);

			if (tangents[vidx0])
			{
				tangents[vidx0][0] += tanx;
				tangents[vidx0][1] += tany;
				tangents[vidx0][2] += tanz;
			}
			else
			{
				tangents[vidx0] = [tanx, tany, tanz];
			}
			
			if (tangents[vidx1])
			{
				tangents[vidx1][0] += tanx;
				tangents[vidx1][1] += tany;
				tangents[vidx1][2] += tanz;
			}
			else
			{
				tangents[vidx1] = [tanx, tany, tanz];
			}

			if (tangents[vidx2])
			{
				tangents[vidx2][0] += tanx;
				tangents[vidx2][1] += tany;
				tangents[vidx2][2] += tanz;
			}
			else
			{
				tangents[vidx2] = [tanx, tany, tanz];
			}
		}
	}

	for (let index = 0; index < obj.faces.length; index += 1)
	{
		let vidx = 0;
		let face = obj.faces[index];

		if (obj.vertices.length > 0)
		{
			let idx = (face[0] - 1) * 3;
			vidx = idx;
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
			vertices.push(tangents[vidx][0], tangents[vidx][1], tangents[vidx][2]);
		}
	}

	return {
		vertices: new Float32Array(vertices),
		vertex_count: obj.faces.length,
		texcoord: texcoord
	};
};
