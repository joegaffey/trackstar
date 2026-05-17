import * as Phaser from 'phaser';

const vertShader = `
#define SHADER_NAME POSTFX_VS
precision mediump float;

attribute vec2 inPosition;
attribute vec2 inTexCoord;

varying vec2 outTexCoord;

void main() {
    gl_Position = vec4(inPosition, 0.0, 1.0);
    outTexCoord = inTexCoord;
}
`;

const fragShader = `
#define SHADER_NAME POSTFX_FS
#define BLUR_SAMPLES 24
#define SHARP_SAMPLES 8
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uBlurStrength;
uniform float uFocusPos;
uniform float uFocusRange;
uniform float uContrast;
uniform float uSaturation;
uniform float uBrightness;
uniform float uSharpen;
uniform float uScanlines;

varying vec2 outTexCoord;

vec3 contrast(vec3 c, float amount) {
    float t = 0.5 - amount * 0.5;
    return c * amount + t;
}

vec3 saturation(vec3 c, float amount) {
    float luma = dot(c, vec3(0.299, 0.587, 0.114));
    return mix(vec3(luma), c, amount);
}

void main() {
    vec2 uv = outTexCoord;
    vec2 px = 1.0 / uResolution;

    vec4 color = texture2D(uMainSampler, uv);

    // sharpen
    if (uSharpen > 0.0) {
        vec3 blur = vec3(0.0);
        float total = 0.0;
        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <= 1; y++) {
                vec2 off = vec2(float(x), float(y)) * px * 1.5;
                float w = 1.0;
                if (x == 0 && y == 0) w = 0.0;
                blur += texture2D(uMainSampler, uv + off).rgb;
                total += 1.0;
            }
        }
        blur /= total;
        vec3 sharp = color.rgb + (color.rgb - blur) * uSharpen;
        color.rgb = mix(color.rgb, sharp, 0.5);
    }

    // color grade
    color.rgb = saturation(color.rgb, uSaturation);
    color.rgb = contrast(color.rgb, uContrast);
    color.rgb += uBrightness;

    // tilt shift blur
    float dy = 1.0 / uResolution.y;
    float dist = abs(uv.y - uFocusPos);
    float blur = smoothstep(uFocusRange * 0.1, uFocusRange * 1.2, dist);
    blur = clamp(blur * uBlurStrength, 0.0, 1.0);

    if (blur > 0.01) {
        vec4 sum = vec4(0.0);
        float totalW = 0.0;
        for (int i = 0; i < BLUR_SAMPLES; i++) {
            float t = float(i) / float(BLUR_SAMPLES - 1) * 2.0 - 1.0;
            float w = exp(-t * t * 2.0);
            vec2 off = vec2(0.0, t * blur * dy * 8.0);
            sum += texture2D(uMainSampler, uv + off) * w;
            totalW += w;
        }
        color = sum / totalW;
    }

    // scanlines
    if (uScanlines > 0.0) {
        float row = floor(uv.y * uResolution.y);
        float scanline = mod(row, 2.0);
        float dark = 1.0 - scanline * uScanlines * 0.6;
        color.rgb *= dark;
    }

    gl_FragColor = color;
}
`;

class PostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game,
            name: 'PostFX',
            fragShader,
            vertShader,
        });

        this.blurStrength = 0;
        this.focusPos = 0.5;
        this.focusRange = 0.3;
        this.contrast = 1.2;
        this.saturation = 1.4;
        this.brightness = 0;
        this.sharpen = 0.5;
        this.scanlines = 0.6;
    }

    onDraw(renderTarget) {
        this.set1f('uBlurStrength', this.blurStrength);
        this.set1f('uFocusPos', this.focusPos);
        this.set1f('uFocusRange', this.focusRange);
        this.set1f('uContrast', this.contrast);
        this.set1f('uSaturation', this.saturation);
        this.set1f('uBrightness', this.brightness);
        this.set1f('uSharpen', this.sharpen);
        this.set1f('uScanlines', this.scanlines);
        this.set2f('uResolution', this.renderer.width, this.renderer.height);
        this.bindAndDraw(renderTarget);
    }
}

export default PostFX;
