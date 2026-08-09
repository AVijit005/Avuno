import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { redactUrl } from '../common/redact-url';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                },
              }
            : undefined,
        // Belt and braces: the serializers below already omit headers, but
        // redact makes it explicit that credentials must never be logged if
        // someone widens them later.
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            'req.body.password',
            'req.body.token',
          ],
          remove: true,
        },
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            // Verification tokens, OAuth codes and signed-URL signatures all
            // travel in query strings on some routes.
            url: redactUrl(req.url),
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
  ],
})
export class LoggerModule {}
