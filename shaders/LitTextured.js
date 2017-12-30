var LitTextured = 
{
	vert: `

    #define SHADER_NAME SHADER_LIT_TEXTURED_VERT
    
    precision lowp float;

    uniform mat4 uModelMatrix;
    uniform mat4 uInvModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    attribute vec3 inPosition;
    attribute vec3 inNormal;
    attribute vec2 inTexCoord;
    attribute vec3 inTangent;

    varying vec3 outEyePosition;
    varying vec3 outNormal;
    varying vec2 outTexCoord;
    varying vec3 outTangent;

    void main()
    {

        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(inPosition, 1.0);

        outEyePosition = vec3(uModelMatrix * vec4(inPosition, 1.0));
        outNormal = vec3(uInvModelMatrix * vec4(inNormal, 0.0));
        outTangent = vec3(uInvModelMatrix * vec4(inTangent, 0.0));
        outTexCoord = inTexCoord;
    }
    `,

	frag: `

    #define SHADER_NAME SHADER_LIT_TEXTURED_FRAG

    precision lowp float;

    struct Material
    {
        vec3 ambient;
        vec3 diffuse;
        vec3 specular;
        vec3 emission;
        float shininess;
    };

    struct DirLight
    {
        vec3 direction;
        vec3 ambient;
        vec3 diffuse;
        vec3 specular;
        bool active;
    };

    struct PointLight
    {
        vec3 position;
        vec3 color;
        float intensity;
        float range;
        bool active;
    };

    #define POINT_LIGHT_COUNT 16

    uniform sampler2D uMainSampler;
    uniform sampler2D uNormalSampler;
    uniform Material uMaterial;
    uniform DirLight uDirLight;
    uniform PointLight uPointLights[POINT_LIGHT_COUNT];
    uniform vec3 uCameraPos;

    varying vec3 outEyePosition;
    varying vec3 outNormal;
    varying vec2 outTexCoord;
    varying vec3 outTangent;

    float SafePow(float x, float y)
    {
        return (y > 0.0) ? pow(x, y) : 0.0;
    }

    vec3 GetDirLight(DirLight light, Material material, vec3 normal, vec3 eyeView)
    {
        vec3 finalColor = vec3(0);
        float normDotLight = max(dot(normalize(normal), normalize(light.direction)), 0.0);
        vec3 diffuse = normDotLight * (material.diffuse + light.diffuse / 2.0);
        vec3 halfVector = normalize(eyeView + normalize(light.direction));
        float normDotHalfVec = max(dot(normalize(normal), halfVector), 0.0);
        vec3 specular = SafePow(normDotHalfVec, material.shininess) * (material.specular + light.specular / 2.0);
        vec3 ambient = (material.ambient + light.ambient / 2.0);

        finalColor = diffuse + specular + ambient + material.emission;

        return finalColor;

    }

    vec3 GetPointLight(PointLight light, Material material, vec3 normal, vec3 eyeView)
    {
        vec3 finalColor = vec3(0.0);
        vec3 lightDir = light.position - eyeView;
        float normDotLight = max(dot(normalize(normal), normalize(lightDir)), 0.0);
        float lightDistance = length(lightDir);
        float denom = max(lightDistance - light.range, 0.0) / light.range + 1.0;
        float attenuation = max(light.intensity / (denom * denom), 0.0);
        vec3 diffuse = (normDotLight * (material.diffuse + light.color / 2.0));
        vec3 halfVector = normalize(eyeView + lightDir);
        float normDotHalfVec = max(dot(normalize(normal), halfVector), 0.0);
        vec3 specular = (material.specular + light.color / 2.0) * SafePow(normDotHalfVec, material.shininess);
        finalColor = attenuation * (diffuse + specular);

        return finalColor;
    }

    vec3 GetNormal(vec3 normal, vec3 tangent, vec3 normalMap)
    {
        vec3 norm = normalize(normal);
        vec3 tan = normalize(tangent);
        tan = normalize(tan - dot(tan, norm) * norm);
        vec3 bitan = cross(tan, norm);
        mat3 tbn = mat3(tan, bitan, norm);
        vec3 result = tbn * normalMap;
        result = normalize(result);
        return result;        
    }

    void main()
    {
        vec3 finalColor = vec3(0.0);
        vec4 texColor = texture2D(uMainSampler, outTexCoord);
        vec4 texNormColor = texture2D(uNormalSampler, outTexCoord);
        vec3 texNorm = normalize(vec3(texNormColor.rgb * 2.0 - 1.0));
        vec3 normal = GetNormal(outNormal, outTangent, texNorm);

        if (uDirLight.active)
        {
            finalColor += GetDirLight(uDirLight, uMaterial, normal, uCameraPos);
        }

        for (int index = 0; index < POINT_LIGHT_COUNT; ++index)
        {   
            if (uPointLights[index].active)
            {
                finalColor += GetPointLight(uPointLights[index], uMaterial, normal, outEyePosition);
            }
        }

        gl_FragColor = texColor * vec4(finalColor, 1.0);

    }

    `
};
