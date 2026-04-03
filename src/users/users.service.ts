import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserDatabaseService } from '@app/users/db/users.db.service';
import { ChangePasswordDto } from '@app/iam/authentication/dto';
import { omit } from '@app/core/utils/functions';
import { HashingService } from '@app/users/hashing.service';
import ResetPasswordDto from '@app/users/dto/reset-user-password.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userDatabaseService: UserDatabaseService,
    private readonly hashingService: HashingService,
  ) {}

  async create(data: any, tx: any = null) {
    const baseData = {
      email: data.email.toLowerCase().trim(),
      firstName: (data.firstName || '').toUpperCase().trim(),
      lastName: (data.lastName || '').toUpperCase().trim(),
    };

    return await this.userDatabaseService.create(
      {
        ...data,
        ...baseData,
      },
      tx,
    );
  }

  async findAll(filterOptions: any, paginationOptions: any) {
    const [data, totalCount] = await this.userDatabaseService.findAll(
      filterOptions,
      paginationOptions,
      ['accounts'],
    );
    return { data, totalCount: Number(totalCount) };
  }

  async findOne(id: number) {
    return this.userDatabaseService.findById(id, ['accounts']);
  }

  async update(id: number, data: any) {
    const updateData: any = omit(data, ['accountId']);

    if (data?.firstName) {
      updateData.firstName = data.firstName.toUpperCase().trim();
    }
    if (data?.lastName) {
      updateData.lastName = data.lastName.toUpperCase().trim();
    }
    if (data?.email) {
      updateData.email = data.email.toLowerCase().trim();
    }

    return await this.userDatabaseService.update(id, updateData);
  }

  async changePassword(
    id: number,
    { oldPassword, newPassword }: ChangePasswordDto,
  ) {
    const user = await this.userDatabaseService.findFirst({ id });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isValidPassword = await this.hashingService.comparePasswords(
      oldPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('The provided password is incorrect');
    }
    const hashedNewPassword = await this.hashingService.hashPassword(newPassword);

    await this.userDatabaseService.update(user.id, {
      password: hashedNewPassword,
      isFirstLogin: false,
    });

    return { message: 'Password changed successfully' };
  }

  async resetPassword(email: string, { password }: ResetPasswordDto) {
    const user = await this.userDatabaseService.findFirst({ email });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const hashedPassword = await this.hashingService.hashPassword(password);

    await this.userDatabaseService.update(user.id, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async delete(id: number) {
    return this.userDatabaseService.delete(id);
  }

  async userExists(email: string) {
    const user = await this.userDatabaseService.findFirst({ email });
    return !!user;
  }
}
