<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BugController extends Controller
{
    /**
     * List all bugs, with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Bug::with(['reporter:id,name', 'assignee:id,name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->has('assignee_id')) {
            $query->where('assignee_id', $request->assignee_id);
        }

        $bugs = $query->latest()->paginate(15);

        return response()->json($bugs);
    }

    /**
     * Create a new bug report.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'severity'    => ['sometimes', Rule::in(['minor', 'major', 'critical', 'blocker'])],
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $validated['reporter_id'] = $request->user()->id;
        $validated['status'] = 'reported';

        $bug = Bug::create($validated);
        $bug->load(['reporter:id,name', 'assignee:id,name']);

        return response()->json($bug, 201);
    }

    /**
     * Show a single bug.
     */
    public function show(Bug $bug): JsonResponse
    {
        $bug->load(['reporter:id,name,email', 'assignee:id,name,email']);

        return response()->json($bug);
    }

    /**
     * Update a bug (status, priority, assignee, etc.).
     */
    public function update(Request $request, Bug $bug): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status'      => ['sometimes', Rule::in(['reported', 'in_progress', 'resolved', 'closed'])],
            'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'severity'    => ['sometimes', Rule::in(['minor', 'major', 'critical', 'blocker'])],
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $bug->update($validated);
        $bug->load(['reporter:id,name', 'assignee:id,name']);

        return response()->json($bug);
    }

    /**
     * Delete a bug report.
     */
    public function destroy(Bug $bug): JsonResponse
    {
        $bug->delete();

        return response()->json(['message' => 'Bug deleted successfully.']);
    }
}
