import { Router, Request, Response } from "express";
import service from "./service";
import WorkController from "./controller"

const router = Router({ mergeParams: true })
const ctrl = WorkController

// GET all works
router.route("/").get(ctrl.getAll)

// GET work by ID
router.route("/:id").get(ctrl.getById)

// CREATE new work
router.route("/").post(ctrl.create)

// UPDATE work by ID
router.route("/:id").put(ctrl.update)

// DELETE work by ID
router.route("/:id").delete(ctrl.delete)

export default router;