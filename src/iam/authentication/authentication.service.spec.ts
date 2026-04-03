import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserDatabaseService } from '@app/users/db/users.db.service';
import { HashingService } from '@app/users/hashing.service';
import { AccountsService } from '@app/accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@app/core/database/prisma.service';
import jwtConfig from '@app/iam/config/jwt.config';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AccountType } from '@prisma/client';

const mockUserDb = {
  findFirstBy: jest.fn(),
  update: jest.fn(),
};

const mockHashing = {
  comparePasswords: jest.fn(),
  hashPassword: jest.fn(),
};

const mockJwt = {
  signAsync: jest.fn(),
};

const mockPrisma = {
  user: {
    update: jest.fn(),
  },
};

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserDatabaseService, useValue: mockUserDb },
        { provide: HashingService, useValue: mockHashing },
        { provide: AccountsService, useValue: {} },
        { provide: JwtService, useValue: mockJwt },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: jwtConfig.KEY, useValue: { secret: 'test', accessTokenTtl: 3600 } },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const loginDto = { email: 'test@bureauos.space', password: 'password123' };

    it('should throw NotFoundException if user missing', async () => {
      mockUserDb.findFirstBy.mockResolvedValue(null);

      await expect(service.signIn(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      mockUserDb.findFirstBy.mockResolvedValue({ id: 1, password: 'hashed', email: 'test@bureauos.space' });
      mockHashing.comparePasswords.mockResolvedValue(false);

      await expect(service.signIn(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should sign tokens if credentials correct', async () => {
      mockUserDb.findFirstBy.mockResolvedValue({ 
        id: 1, 
        password: 'hashed', 
        email: 'test@bureauos.space',
        accounts: [{ id: 10, type: AccountType.BUSINESS }]
      });
      mockHashing.comparePasswords.mockResolvedValue(true);
      mockJwt.signAsync.mockResolvedValue('signed-token');

      const result = await service.signIn(loginDto);

      expect(result.accessToken).toBe('signed-token');
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });
  });
});
