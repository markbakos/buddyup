import { IsString, IsOptional, IsArray, IsUrl, ValidateNested, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class ExperienceDto {
    @IsString()
    company: string;

    @IsString()
    position: string;

    @IsDateString()
    startDate: Date;

    @IsDateString()
    @IsOptional()
    endDate?: Date;

    @IsBoolean()
    current: boolean;

    @IsString()
    description: string;
}

class EducationDto {
    @IsString()
    institution: string;

    @IsString()
    degree: string;

    @IsString()
    field: string;

    @IsDateString()
    startDate: Date;

    @IsDateString()
    @IsOptional()
    endDate?: Date;

    @IsBoolean()
    current: boolean;
}

class SocialLinkDto {
    @IsString()
    platform: string;

    @IsUrl()
    url: string;
}

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    aboutMe?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    skills?: string[];

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    profession?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExperienceDto)
    @IsOptional()
    experience?: ExperienceDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EducationDto)
    @IsOptional()
    education?: EducationDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialLinkDto)
    @IsOptional()
    socialLinks?: SocialLinkDto[];
} 