import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
  ) {}

  create(title: string, userId: number): Promise<Topic> {
    // slightly awkward, can't pass userId directly unless we explicitly specify FK column (which is probably preferred to do)
    return this.topicsRepository.save({ title, user: { id: userId } });
  }

  findAllByUsername(username: string): Promise<Topic[]> {
    return this.topicsRepository.find({
      relations: {
        user: true,
      },
      where: {
        user: {
          username: username,
        },
      },
    });
  }

  findByUsernameAndTitle(
    username: string,
    title: string,
  ): Promise<Topic | null> {
    return this.topicsRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        title: title,
        user: {
          username: username,
        },
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.topicsRepository.delete(id);
  }
}
