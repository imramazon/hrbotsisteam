import type { Request, Response } from 'express'
import service from './service'

class WorkController {
    async getAll(req: Request, res: Response) {
        try {
            const data = await service.getAll()

            res.status(200).send(data)
        } catch (error: any) {
            res.status(500).send({ msg: 'SERVER_ERROR', data: null })
            throw new Error(
                `WorkController controller [getAll] error: ${error}`,
            )
        }
    }
    async getById(req: Request, res: Response) {
        try {
            const data = await service.getById(req.params.id)

            res.status(200).send(data)
        } catch (error: any) {
            res.status(500).send({ msg: 'SERVER_ERROR', data: null })
            throw new Error(
                `WorkController controller [getById] error: ${error}`,
            )
        }
    }
    async create(req: Request, res: Response) {
        try {
            const { name, description } = req.body;
            
            if (!name || !description) {
                res.status(400).send({
                    msg: 'VALIDATION_ERROR',
                    data: null,
                    errors: {
                        name: !name ? 'Name is required' : undefined,
                        description: !description ? 'Description is required' : undefined
                    }
                });
                return;
            }
            
            const data = await service.create({ name, description });
            
            res.status(201).send(data);
        } catch (error: any) {
            res.status(500).send({ msg: 'SERVER_ERROR', data: null })
            throw new Error(
                `WorkController controller [create] error: ${error}`,
            )
        }
    }
    async update(req: Request, res: Response) {
        try {
            const data = await service.update(req.params.id, req.body)

            res.status(200).send(data)
        } catch (error: any) {
            res.status(500).send({ msg: 'SERVER_ERROR', data: null })
            throw new Error(
                `WorkController controller [update] error: ${error}`,
            )
        }
    }
    async delete(req: Request, res: Response) {
        try {
            const data = await service.delete(req.params.id)

            res.status(200).send(data)
        } catch (error: any) {
            res.status(500).send({ msg: 'SERVER_ERROR', data: null })
            throw new Error(
                `WorkController controller [delete] error: ${error}`,
            )
        }
    }
}

export default new WorkController()
