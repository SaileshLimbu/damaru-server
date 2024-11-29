import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create.user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(user: CreateUserDto) {
    return this.usersRepository.insert(user);
  }

  update(id: string, user: Partial<CreateUserDto>) {
    return this.usersRepository.update(id, user);
  }

  login(googleToken: string) {
    // verifies token
    // check if user exist
    // provides jwt token
    return this.usersRepository.find({
      where: { googleUserId: googleToken },
      relations: { accounts: true },
    });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
