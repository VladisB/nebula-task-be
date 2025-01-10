import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';

@Entity()
export class FileEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    originalUrl: string;

    @Column()
    driveFileId: string;

    @Column()
    fileName: string;

    @Column()
    mimeType?: string;

    @Column()
    size?: number;

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        name: "created_at",
    })
    public createdAt: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)",
        name: "updated_at",
    })
    public updatedAt: Date;
}
