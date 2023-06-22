import { Matches, validateOrReject } from 'class-validator';
import { User } from '../users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
@Index('topics_title_user_key', ['title', 'user'], { unique: true })
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  @Matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,99}$/i) // match github username rules but with repo name length, thanks https://github.com/shinnn/github-username-regex/blob/master/index.js
  title: string;

  @ManyToOne(() => User, (user) => user.topics, { nullable: false })
  @JoinColumn()
  @ApiPropertyOptional()
  user: User;

  // annoying that this is something to set up manually
  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject(this);
  }
}
