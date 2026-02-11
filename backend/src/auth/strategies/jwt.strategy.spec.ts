import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  it('should be defined when JWT_SECRET is present', () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as any;

    strategy = new JwtStrategy(configService);
    expect(strategy).toBeDefined();
  });

  it('should throw when JWT_SECRET is missing', () => {
    const configService = {
      getOrThrow: jest.fn().mockImplementation(() => {
        throw new Error('Configuration key "JWT_SECRET" does not exist');
      }),
    } as any;

    expect(() => new JwtStrategy(configService)).toThrow(
      'Configuration key "JWT_SECRET" does not exist',
    );
  });
});
