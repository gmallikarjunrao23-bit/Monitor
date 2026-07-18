import ping from "ping";
import { lookup } from "dns/promises";
import net from "net";
import tls from "tls";

export interface CheckResult {
  success: boolean;
  statusCode?: number;
  responseTimeMs: number;
  errorMessage?: string;
}

export async function runHttpCheck(
  target: string,
  opts: {
    method?: string;
    timeoutSec?: number;
    expectedStatusCodes?: number[];
    expectedKeyword?: string;
    unexpectedKeyword?: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<CheckResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    (opts.timeoutSec ?? 30) * 1000
  );

  try {
    const res = await fetch(target, {
      method: opts.method ?? "GET",
      headers: opts.headers,
      body: opts.body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const responseTimeMs = Date.now() - start;
    const expected = opts.expectedStatusCodes ?? [200];

    if (!expected.includes(res.status)) {
      return {
        success: false,
        statusCode: res.status,
        responseTimeMs,
        errorMessage: `Unexpected status code: ${res.status}`,
      };
    }

    if (opts.expectedKeyword || opts.unexpectedKeyword) {
      const text = await res.text();
      if (opts.expectedKeyword && !text.includes(opts.expectedKeyword)) {
        return {
          success: false,
          statusCode: res.status,
          responseTimeMs,
          errorMessage: "Expected keyword not found in response",
        };
      }
      if (opts.unexpectedKeyword && text.includes(opts.unexpectedKeyword)) {
        return {
          success: false,
          statusCode: res.status,
          responseTimeMs,
          errorMessage: "Unexpected keyword found in response",
        };
      }
    }

    return { success: true, statusCode: res.status, responseTimeMs };
  } catch (err: any) {
    clearTimeout(timeout);
    return {
      success: false,
      responseTimeMs: Date.now() - start,
      errorMessage: err.name === "AbortError" ? "Request timed out" : err.message,
    };
  }
}

export async function runPingCheck(target: string): Promise<CheckResult> {
  const start = Date.now();
  try {
    const result = await ping.promise.probe(target, { timeout: 10 });
    return {
      success: result.alive,
      responseTimeMs: Date.now() - start,
      errorMessage: result.alive ? undefined : "Host unreachable",
    };
  } catch (err: any) {
    return { success: false, responseTimeMs: Date.now() - start, errorMessage: err.message };
  }
}

export async function runTcpCheck(target: string, port: number, timeoutSec = 10): Promise<CheckResult> {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ success: false, responseTimeMs: Date.now() - start, errorMessage: "Connection timed out" });
    }, timeoutSec * 1000);

    socket.connect(port, target, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ success: true, responseTimeMs: Date.now() - start });
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      resolve({ success: false, responseTimeMs: Date.now() - start, errorMessage: err.message });
    });
  });
}

export async function runDnsCheck(target: string): Promise<CheckResult> {
  const start = Date.now();
  try {
    await lookup(target);
    return { success: true, responseTimeMs: Date.now() - start };
  } catch (err: any) {
    return { success: false, responseTimeMs: Date.now() - start, errorMessage: "DNS resolution failed" };
  }
}

export async function runSslCheck(hostname: string, port = 443): Promise<{
  isValid: boolean;
  issuer?: string;
  validFrom?: Date;
  validTo?: Date;
  daysLeft?: number;
}> {
  return new Promise((resolve) => {
    const socket = tls.connect(port, hostname, { servername: hostname, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();

      if (!cert || !cert.valid_to) {
        resolve({ isValid: false });
        return;
      }

      const validTo = new Date(cert.valid_to);
      const daysLeft = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      resolve({
        isValid: daysLeft > 0,
        issuer: cert.issuer?.O,
        validFrom: new Date(cert.valid_from),
        validTo,
        daysLeft,
      });
    });

    socket.on("error", () => resolve({ isValid: false }));
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ isValid: false });
    });
  });
}
