import { Matches, validateOrReject } from 'class-validator';
import { Topic } from '../topics/topic.entity'; // why did this auto import using incorrect src/topics path
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
@Index('users_username_key', ['username'], { unique: true }) // tragic that this doesn't actually include the cols in the index name
@Index('users_auth_id_key', ['authId'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 39 })
  @Matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i) // match github rules, thanks https://github.com/shinnn/github-username-regex/blob/master/index.js
  username: string;

  // interesting that varchar is default over text
  @Column()
  authId: string;

  @OneToMany(() => Topic, (topic) => topic.user)
  @ApiPropertyOptional()
  topics: Topic[];

  // annoying that this is something to set up manually
  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject(this);
  }
}
