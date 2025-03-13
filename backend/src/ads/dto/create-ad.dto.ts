import {IsNotEmpty, IsOptional, IsString, IsArray, IsBoolean, ValidateNested, Length, IsUUID} from "class-validator";
import {Type} from "class-transformer";

class RoleDTO {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsOptional()
    @IsBoolean()
    isOpen?: boolean
}

export class CreateAdDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    @Length(0, 100)
    summary: string
    
    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    @IsString()
    location: string
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[]
    
    @IsOptional()
    metadata?: Record<string, any>

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true})
    @Type(() => RoleDTO)
    roles?: RoleDTO[]

    @IsOptional()
    @IsUUID()
    userId: string
}