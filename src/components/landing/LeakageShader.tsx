// @ts-nocheck
'use client';

import React, { useEffect, useRef, useCallback } from 'react';

export function LeakageShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const render = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.039, 0.055, 0.075);
    vec2 grid = fract(uv * 40.0);
    float line = step(0.98, grid.x) + step(0.98, grid.y);
    color += line * 0.02;
    float scanline = sin(uv.y * 100.0 + u_time * 2.0) * 0.02;
    color += scanline;
    float particles = 0.0;
    for(float i = 0.0; i < 5.0; i++) {
        vec2 p = uv * vec2(10.0, 2.0) + vec2(u_time * 0.1 * (i + 1.0), u_time * 0.5);
        particles += smoothstep(0.95, 1.0, noise(floor(p))) * 0.05;
    }
    vec3 orange = vec3(0.886, 0.416, 0.118);
    color = mix(color, orange, particles * uv.y);
    gl_FragColor = vec4(color, 1.0);
}`;

    function cs(type: number, src: string) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function frame(t: number) {
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(frame);
    }

    syncSize();
    rafRef.current = requestAnimationFrame(frame);

    if (typeof ResizeObserver !== 'undefined') {
      observerRef.current = new ResizeObserver(syncSize);
      observerRef.current.observe(canvas);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    render(0);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [render]);

  if (typeof window === 'undefined') return null;

  return (
    <canvas
      ref={canvasRef}
      id="cargoiq-leakage-shader"
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
