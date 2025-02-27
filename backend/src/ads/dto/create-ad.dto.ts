import { IsNotEmpty, IsOptional, IsString, IsArray} from "class-validator";

export class CreateAdDto {
    @IsNotEmpty()
    @IsString()
    title: string
    
    @IsNotEmpty()
    @IsString()
    description: string
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[]
    
    @IsOptional()
    metadata?: Record<string, any>
}